/* eslint-disable @typescript-eslint/no-use-before-define */
import Logger from "js-logger";
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { walletBalanceUpdate, selectActiveWallet } from "@/redux/wallet";
import { setPreference, selectIsChipnet } from "@/redux/preferences";
import { txHistoryFetch } from "@/redux/txHistory";

import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";

import { block_checkpoints } from "@/util/block_checkpoints";

const Electrum = ElectrumService();

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request/retry electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (payload: { attempts: number; server: string }, thunkApi) => {
    Logger.log("sync/connect", payload);
    try {
      // attempt connection
      await Electrum.connect(payload.server);
    } catch (e) {
      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);

      // 3 attempts, over 12 seconds total, per server
      if (payload.attempts < 2) {
        setTimeout(
          () =>
            thunkApi.dispatch(
              syncConnect({ ...payload, attempts: payload.attempts + 1 })
            ),
          Math.min(1000 * (payload.attempts + 1) * 2, 10 * 1000)
        );
      } else {
        // try a different server
        const isChipnet = selectIsChipnet(thunkApi.getState());
        const newServer = Electrum.selectFallbackServer(
          payload.server,
          isChipnet
        );
        thunkApi.dispatch(syncConnect({ server: newServer, attempts: 0 }));

        if (!isChipnet) {
          thunkApi.dispatch(
            setPreference({ key: "electrumServer", value: newServer })
          );
        }
        return newServer;
      }
    }

    return payload.server;
  }
);

// syncReconnect: force disconnect and attempt fresh connection to server
export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (server: string | undefined, thunkApi) => {
    const connectServer = server || Electrum.getElectrumHost();
    // cleanup electrum subscriptions (force=true)
    await Electrum.disconnect(true);
    thunkApi.dispatch(syncConnect({ attempts: 0, server: connectServer }));
  }
);

// syncConnectionUp: fired when electrum connection is up
export const syncConnectionUp = createAsyncThunk(
  "sync/up",
  (server: string, thunkApi) => {
    // set up subscriptions on connect
    Electrum.subscribeToChaintip();
    thunkApi.dispatch(syncReceiveSubscriptions());
    thunkApi.dispatch(syncChangeAddresses());
    //thunkApi.dispatch(syncHotRefresh());

    return server;
  }
);

// syncConnectionDown: fired if electrum connection goes down
export const syncConnectionDown = createAsyncThunk(
  "sync/down",
  (payload, thunkApi) => {
    // attempt reconnect when connection goes down
    thunkApi.dispatch(syncReconnect());
  }
);

// syncReceiveSubscriptions: set up subscriptions to all receive addresses
export const syncReceiveSubscriptions = createAsyncThunk(
  "sync/receiveSubscriptions",
  (payload, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);

    const subscribeAddresses = AddressManager.getReceiveAddresses();
    subscribeAddresses.forEach((address) =>
      thunkApi.dispatch(syncSubscribeAddress(address))
    );
  }
);

// syncSubscribeAddress: subscribe to state updates for an address
export const syncSubscribeAddress = createAsyncThunk(
  "sync/subscribeAddress",
  async (address: AddressEntity, thunkApi) => {
    // get initial address state
    const subscription = await Electrum.subscribeToAddress(address);

    if (address.state !== subscription.addressState) {
      // update address state if necessary upon subscription
      thunkApi.dispatch(
        syncAddressState([subscription.address, subscription.addressState])
      );
    }

    return [subscription.address, subscription.addressState];
  }
);

// syncChangeAddresses: syncs all change addresses
export const syncChangeAddresses = createAsyncThunk(
  "sync/changeAddresses",
  async (payload, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());

    const AddressManager = AddressManagerService(wallet);

    const changeAddresses = AddressManager.getChangeAddresses();

    const promises = changeAddresses
      .filter((address) => !(address.state !== null && address.balance === 0)) // don't resync fully spent change addresses
      .map(async (address) => {
        const addressState = await Electrum.requestAddressState(
          address.address
        );
        thunkApi.dispatch(syncAddressState([address, addressState]));
        //Logger.debug("sync/changeAddresses", address, addressState);
        return [address, addressState];
      });

    const batchedPromises = [];

    while (promises.length > 0) {
      batchedPromises.concat(promises.slice(0, 1000));
      promises.splice(0, 1000);
    }

    batchedPromises.forEach((batch) => Promise.all(batch));
  }
);

// syncAddressState: fired when data acquired from address subscription
export const syncAddressState = createAsyncThunk(
  "sync/addressState",
  (payload: [AddressEntity | string, string], thunkApi) => {
    // get subscription response data from payload
    const [address, addressState] = payload;

    // check downloaded state against local state
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);

    // catch for payload from direct electrum subscription
    let addressObj: AddressEntity =
      typeof address === "string"
        ? AddressManager.getAddress(address)
        : address;

    if (addressObj.state !== addressState) {
      addressObj = AddressManager.updateAddressState(addressObj, addressState);
      // if state updated, get utxos for address
      //Logger.debug("address state changed for", addressObj, addressState);
      thunkApi.dispatch(syncAddressUtxos(addressObj));

      // queue history sync after all other requests have finished
      queueMicrotask(() => thunkApi.dispatch(syncAddressHistory(addressObj)));
    }

    return [addressObj, addressState];
  }
);

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address: AddressEntity, thunkApi) => {
    const addr = address.address;

    // we will always need the up-to-date utxo set
    const utxos = await Electrum.requestUtxos(addr);

    const wallet = selectActiveWallet(thunkApi.getState());

    const AddressManager = AddressManagerService(wallet);
    const UtxoManager = UtxoManagerService(wallet);

    // we need to delete our knowledge of UTXO set
    // in case some utxos were spent elsewhere
    // i.e. wallet seed shared on multiple devices
    UtxoManager.discardAddressUtxos(addr);

    // register each UTXO, add tx to history
    utxos.forEach((utxo) => {
      UtxoManager.registerUtxo(addr, utxo);

      AddressManager.registerTransaction(addr, {
        tx_hash: utxo.tx_hash,
        height: utxo.height,
      });

      /*
      // TODO: validate that the UTXOs pass merkle inclusion
      // for now we just trust that fulcrum isn't lying to us
      listenerApi.dispatch(syncBlock(utxo.height));
      listenerApi.dispatch(syncTxRequest(utxo.tx_hash));
      */
    });

    const isChange = address.change === 1;

    // update wallet balance; view re-renders on wallet update
    thunkApi.dispatch(
      walletBalanceUpdate({
        wallet_id: wallet.id,
        previousBalance: wallet.balance,
        isChange,
      })
    );

    thunkApi.dispatch(syncPopulateAddresses());

    //Logger.debug("sync/addressUtxos", { address, utxos });
    return {
      address,
      utxos,
    };
  }
);

const syncAddressHistory = createAsyncThunk(
  "sync/addressHistory",
  async (address: AddressEntity, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);

    const calculatedAddressState =
      AddressManager.calculateAddressState(address);
    const storedAddressState = address.state;

    if (calculatedAddressState !== storedAddressState) {
      //Logger.debug("sync/addressHistory requesting", address.address);
      const history = await Electrum.requestAddressHistory(address.address);
      history.forEach((historyTx) =>
        AddressManager.registerTransaction(address.address, historyTx)
      );
    }

    /*Logger.debug(
      "sync/addressHistory",
      calculatedAddressState,
      storedAddressState,
      calculatedAddressState !== storedAddressState
    );*/
  }
);

export const syncPopulateAddresses = createAction<number | undefined>(
  "sync/populateAddresses"
);
syncMiddleware.startListening({
  actionCreator: syncPopulateAddresses,
  effect: async (action, listenerApi) => {
    const wallet = selectActiveWallet(listenerApi.getState());
    const AddressManager = AddressManagerService(wallet);

    const nScanMore = action.payload;

    const generatedAddresses = AddressManager.populateAddresses(nScanMore);

    // subscribe to the new addresses
    generatedAddresses.forEach((address) =>
      listenerApi.dispatch(syncSubscribeAddress(address))
    );
  },
});

export const syncHotRefresh = createAsyncThunk(
  "sync/hotRefresh",
  async (payload, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const sync = selectSyncState(thunkApi.getState());

    // only allow hot sync after cooldown
    const hotSyncCooldown = 10 * 1000;

    // how many additional addresses to scan (attempt to detect funds beyond the gap)
    const nSyncMore = 100;
    thunkApi.dispatch(syncPopulateAddresses(nSyncMore));

    if (!sync.isSyncing && sync.lastRefresh < Date.now() - hotSyncCooldown) {
      const AddressManager = AddressManagerService(wallet);
      const UtxoManager = UtxoManagerService(wallet);

      // "hot" addresses are any addresses with UTXOs on them
      const walletUtxos = UtxoManager.getWalletUtxos();
      const hotAddresses = walletUtxos.map((utxo) =>
        AddressManager.getAddress(utxo.address)
      );

      // check unused change addresses (attempts to fill gaps)
      const unusedChangeAddresses = AddressManager.getUnusedAddresses(0, 1);

      // check recent change addresses (tries to catch undetected spends)
      const recentChangeAddresses = AddressManager.getRecentAddresses(50, 1);

      // check all receive addresses (all user-managed addresses)
      const receiveAddresses = AddressManager.getReceiveAddresses();

      const syncAddresses = [
        ...hotAddresses,
        ...recentChangeAddresses,
        ...unusedChangeAddresses,
        ...receiveAddresses,
      ];

      Promise.all(
        syncAddresses.map(async (address) => {
          const addressState = await Electrum.requestAddressState(
            address.address
          );
          thunkApi.dispatch(syncAddressState([address, addressState]));
        })
      );

      Logger.debug("sync/hotRefresh", syncAddresses, sync);
    }

    return Date.now();
  }
);

export const syncBlock = createAsyncThunk(
  "sync/block",
  async (height: number) => {
    const Blockchain = BlockchainService();
    let block = await Blockchain.getBlockByHeight(height);

    if (block === null || block.header === null) {
      const header = await Electrum.requestBlock(height);
      await Blockchain.registerBlock({ header, height });
      block = await Blockchain.getBlockByHeight(height);
    }

    // Logger.log("sync/block", block);
    return block;
  }
);

export const syncChaintip = createAction("sync/chaintip");
syncMiddleware.startListening({
  actionCreator: syncChaintip,
  effect: async (action, listenerApi) => {
    const chaintip = action.payload;
    Logger.log("sync/chaintip", chaintip);
    listenerApi.dispatch(syncBlock(chaintip.height));

    await TransactionManagerService().purgeTransactions();
    await BlockchainService().purgeBlocks();
  },
});

const initialPending = {
  utxo: 0,
  history: 0,
  txState: 0,
};
const initialState = {
  connected: false,
  server: "",
  syncPending: { ...initialPending },
  chaintip: { ...block_checkpoints.first2023 },
  addresses: {},
  lastRefresh: Date.now(),
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnectionUp.fulfilled, (state: RootState, action) => {
      state.connected = true;
      state.server = action.payload;
    })
    .addCase(syncConnectionDown.pending, (state: RootState) => {
      state.connected = false;
    })
    .addCase(syncReconnect.pending, (state: RootState) => {
      state.connected = false;
    })
    .addCase(syncSubscribeAddress.pending, (state: RootState) => {
      state.syncPending.txState += 1;
    })
    .addCase(syncSubscribeAddress.fulfilled, (state: RootState, action) => {
      const [address] = action.payload;
      state.addresses[address.address] = address;
      state.syncPending.txState -= 1;
    })
    .addCase(syncAddressState.pending, (state: RootState) => {
      state.syncPending.txState += 1;
    })
    .addCase(syncAddressState.fulfilled, (state: RootState, action) => {
      const [address] = action.payload;
      state.addresses[address.address] = address;
      state.syncPending.txState -= 1;
    })
    .addCase(syncAddressState.rejected, (state: RootState) => {
      state.syncPending.txState -= 1;
    })
    .addCase(syncAddressUtxos.pending, (state: RootState) => {
      state.syncPending.utxo += 1;
    })
    .addCase(syncAddressUtxos.fulfilled, (state: RootState) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressUtxos.rejected, (state: RootState) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressHistory.pending, (state: RootState) => {
      state.syncPending.history += 1;
    })
    .addCase(syncAddressHistory.fulfilled, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(syncAddressHistory.rejected, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(txHistoryFetch.pending, (state: RootState) => {
      state.syncPending.history += 1;
    })
    .addCase(txHistoryFetch.fulfilled, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(txHistoryFetch.rejected, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(syncChangeAddresses.pending, (state: RootState) => {
      state.syncPending.txState += 1;
    })
    .addCase(syncChangeAddresses.fulfilled, (state: RootState) => {
      state.syncPending.txState -= 1;
    })
    .addCase(syncChangeAddresses.rejected, (state: RootState) => {
      state.syncPending.txState -= 1;
    })
    .addCase(syncChaintip, (state, action) => {
      const { hex, height } = action.payload;
      state.chaintip = {
        blockhash: BlockchainService().calculateBlockhash(hex),
        header: hex,
        height,
      };
    })
    .addCase(syncHotRefresh.fulfilled, (state: RootState, action) => {
      state.lastRefresh = action.payload;
    });
});

export const selectSyncState = createSelector(
  (state: RootState) => state.sync,
  (sync) => ({
    ...sync,
    isSyncing: Object.keys(sync.syncPending).reduce(
      (isSyncing, pending) => sync.syncPending[pending] > 0 || isSyncing,
      false
    ),
    syncCount: Object.keys(sync.syncPending).reduce(
      (syncCount, pending) => syncCount + sync.syncPending[pending],
      0
    ),
  })
);

export const selectMyAddresses = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.addresses
);

/*
const mergeUtxoMerkle = (utxo, merkle) => ({
  ...utxo,
  height: utxo.height === merkle.block_height ? utxo.height : null,
  merkle: merkle.merkle,
  block_pos: merkle.pos,
});
*/
