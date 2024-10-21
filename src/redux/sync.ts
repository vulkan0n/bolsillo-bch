/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import {
  walletBalanceUpdate,
  selectActiveWallet,
  walletNonce,
} from "@/redux/wallet";
import { setPreference, selectIsChipnet } from "@/redux/preferences";
import { txHistoryFetch } from "@/redux/txHistory";
import { selectNetworkStatus } from "@/redux/device";

import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";

import { block_checkpoints } from "@/util/block_checkpoints";

const Log = LogService("redux/sync");

const Electrum = ElectrumService();

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request/retry electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (payload: { attempts: number; server: string }, thunkApi) => {
    Log.log("sync/connect", payload);
    try {
      await Electrum.connect(payload.server);
    } catch (e) {
      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);

      // try multiple servers only if device reports active network connection
      const { isConnected: isNetworkConnected } = selectNetworkStatus(
        thunkApi.getState()
      );

      // 3 attempts per server
      if (payload.attempts < 2 || !isNetworkConnected) {
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
  (server: string, thunkApi): string => {
    // set up subscriptions on connect
    Electrum.subscribeToChaintip();
    thunkApi.dispatch(syncWalletAddresses());

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

// syncWalletAddresses: generate wallet addresses and set up subscriptions
export const syncWalletAddresses = createAsyncThunk(
  "sync/walletAddresses",
  async (payload, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);
    const AddressScanner = AddressScannerService(wallet);

    AddressScanner.populateAddresses();

    Promise.all(
      AddressManager.getReceiveAddresses().map(async (address) => {
        const subscription = await Electrum.subscribeToAddress(address);
        thunkApi.dispatch(
          syncAddressState([address, subscription.addressState])
        );
      })
    );

    thunkApi.dispatch(syncChangeAddresses());
  }
);

// syncChangeAddresses: syncs all change addresses
export const syncChangeAddresses = createAsyncThunk(
  "sync/changeAddresses",
  async (payload, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());

    const AddressManager = AddressManagerService(wallet);

    const changeAddresses = AddressManager.getChangeAddresses();

    const promises = changeAddresses
      .filter((address) => !(address.state !== null && address.balance === 0)) // don't resync fully spent change addresses
      .map(async (address) => {
        const subscription = await Electrum.subscribeToAddress(address);

        thunkApi.dispatch(
          syncAddressState([address, subscription.addressState])
        );
        //Log.debug("sync/changeAddresses", address, addressState);
        return [address, subscription.addressState];
      });

    const batchedPromises = [];
    const batch_chunk_size = 1024;

    while (promises.length > 0) {
      batchedPromises.concat(promises.slice(0, batch_chunk_size));
      promises.splice(0, batch_chunk_size);
    }

    batchedPromises.forEach(async (batch) => {
      Promise.all(batch);
    });
  }
);

// syncAddressState: fired when data acquired from address subscription
export const syncAddressState = createAsyncThunk(
  "sync/addressState",
  (
    payload: [AddressEntity, string | null],
    thunkApi
  ): [AddressEntity, string | null] => {
    // get subscription response data from payload
    const [address, addressState] = payload;

    // catch for payload from direct electrum subscription
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);

    const addressObj: AddressEntity =
      typeof address === "string"
        ? AddressManager.getAddress(address)
        : address;

    // check downloaded state against local state
    if (addressObj.state !== addressState) {
      //Log.debug("address state changed for", address, addressState);
      thunkApi.dispatch(syncAddressUtxos(addressObj));
      thunkApi.dispatch(syncAddressHistory(addressObj));
    }

    thunkApi.dispatch(walletNonce());

    return [addressObj, addressState];
  }
);

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address: AddressEntity, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    await AddressScannerService(wallet).scanUtxos(address.address);

    // update wallet balance; view re-renders on wallet update
    const isChange = address.change === 1;
    thunkApi.dispatch(
      walletBalanceUpdate({
        wallet,
        isChange,
      })
    );
  }
);

export const syncAddressHistory = createAsyncThunk(
  "sync/addressHistory",
  async (address: AddressEntity, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);
    const AddressScanner = AddressScannerService(wallet);

    const storedAddressState = address.state;

    const calculatedAddressState = AddressManager.calculateAddressState(
      address.address
    );

    if (
      calculatedAddressState !== storedAddressState ||
      storedAddressState === null
    ) {
      await AddressScanner.scanHistory(address.address);
    }
  }
);
syncMiddleware.startListening({
  actionCreator: syncAddressHistory.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncPopulateAddresses());
  },
});

export const syncPopulateAddresses = createAsyncThunk(
  "sync/populateAddresses",
  async (action, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressScanner = AddressScannerService(wallet);

    const generatedAddresses = AddressScanner.populateAddresses();

    await Promise.all(
      generatedAddresses.map(async (address) => {
        const subscription = await Electrum.subscribeToAddress(address);
        thunkApi.dispatch(
          syncAddressState([subscription.address, subscription.addressState])
        );
      })
    );
  }
);

export const syncHotRefresh = createAsyncThunk(
  "sync/hotRefresh",
  async (payload: { force: boolean }, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const sync = selectSyncState(thunkApi.getState());

    // only allow hot sync after cooldown
    const hotSyncCooldown = 10 * 1000;

    // how many additional addresses to scan (attempt to detect funds beyond the gap)
    const nScanMore = 1600;

    if (
      (!sync.isSyncing && sync.lastRefresh < Date.now() - hotSyncCooldown) ||
      payload.force
    ) {
      const AddressScanner = AddressScannerService(wallet);
      const AddressManager = AddressManagerService(wallet);
      const UtxoManager = UtxoManagerService(wallet);

      thunkApi.dispatch(syncWalletAddresses());

      // "hot" addresses are any addresses with UTXOs on them
      const walletUtxos = UtxoManager.getWalletUtxos();
      const hotAddresses = walletUtxos.map((utxo) =>
        AddressManager.getAddress(utxo.address)
      );

      await Promise.all(
        hotAddresses.map(async (address) => {
          const addressState = await Electrum.requestAddressState(
            address.address
          );
          thunkApi.dispatch(syncAddressState([address, addressState]));
        })
      );

      // scan change from first unused index to last index + nScanMore
      await AddressScanner.scanMoreAddresses(nScanMore, 1);

      thunkApi.dispatch(syncPopulateAddresses());
      thunkApi.dispatch(walletBalanceUpdate({ wallet, isChange: false }));

      Log.debug("sync/hotRefresh", sync);
    }

    return Date.now();
  }
);

export const syncBlock = createAsyncThunk(
  "sync/block",
  async (height: number) => {
    const Blockchain = BlockchainService();
    let block;
    try {
      block = await Blockchain.getBlockByHeight(height);
    } catch {
      const header = await Electrum.requestBlock(height);
      await Blockchain.registerBlock({ header, height });
      block = await Blockchain.getBlockByHeight(height);
    }

    Log.log("sync/block", block);
    return block;
  }
);

export const syncChaintip = createAction<{ height: number; hex: string }>(
  "sync/chaintip"
);
syncMiddleware.startListening({
  actionCreator: syncChaintip,
  effect: async (action, listenerApi) => {
    const chaintip = action.payload;
    Log.log("sync/chaintip", chaintip);
    listenerApi.dispatch(syncBlock(chaintip.height));

    await TransactionManagerService().purgeTransactions();
    await BlockchainService().purgeBlocks();
  },
});

const initialPending = {
  utxo: 0,
  history: 0,
  txState: 0,
  change: 0,
  rebuild: 0,
};
const initialState = {
  isConnected: false,
  server: "",
  syncPending: { ...initialPending },
  chaintip: { ...block_checkpoints.first2023 },
  addresses: {},
  lastRefresh: Date.now(),
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnectionUp.fulfilled, (state: RootState, action) => {
      state.isConnected = true;
      state.server = action.payload;
    })
    .addCase(syncConnectionDown.pending, (state: RootState) => {
      state.isConnected = false;
    })
    .addCase(syncReconnect.pending, (state: RootState) => {
      state.isConnected = false;
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
      state.syncPending.change += 1;
    })
    .addCase(syncChangeAddresses.fulfilled, (state: RootState) => {
      state.syncPending.change -= 1;
    })
    .addCase(syncChangeAddresses.rejected, (state: RootState) => {
      state.syncPending.change -= 1;
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
