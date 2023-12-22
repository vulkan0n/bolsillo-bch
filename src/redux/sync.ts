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
import { fetchExchangeRates } from "@/redux/exchangeRates";
import {
  setPreference,
  selectCurrencySettings,
  selectIsChipnet,
} from "@/redux/preferences";

import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionHistoryService from "@/services/TransactionHistoryService";
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
      }
    }
  }
);

// syncReconnect: force disconnect and attempt fresh connection to server
export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (server: string | undefined, thunkApi) => {
    const connectServer = server || Electrum.getElectrumHost();
    await Electrum.disconnect(true);
    thunkApi.dispatch(syncConnect({ attempts: 0, server: connectServer }));
  }
);

// syncConnectionUp: fired when electrum connection is up
// set up electrum subscriptions to all receive addresses
export const syncConnectionUp = createAction<string>("sync/up");
syncMiddleware.startListening({
  actionCreator: syncConnectionUp,
  effect: async (action, listenerApi) => {
    // set up subscriptions on connect
    Electrum.subscribeToChaintip();

    const wallet = selectActiveWallet(listenerApi.getState());

    const AddressManager = AddressManagerService(wallet);

    const subscribeAddresses = AddressManager.getReceiveAddresses();
    subscribeAddresses.forEach((address) =>
      listenerApi.dispatch(syncSubscribeAddress(address))
    );

    const changeAddresses = AddressManager.getChangeAddresses();
    changeAddresses.forEach((address) =>
      listenerApi.dispatch(
        syncChangeAddress({
          address,
          latestIndex: changeAddresses[changeAddresses.length - 1].hd_index,
        })
      )
    );
  },
});

// syncConnectionDown: fired if electrum connection goes down
// destroy electrum connection and reissue syncConnect action
export const syncConnectionDown = createAction("sync/down");
syncMiddleware.startListening({
  actionCreator: syncConnectionDown,
  effect: async (action, listenerApi) => {
    const server = Electrum.getElectrumHost();

    // cleanup electrum subscriptions (force=true)
    Electrum.disconnect(true);
    // we'll handle reconnecting ourselves
    listenerApi.dispatch(syncConnect({ server, attempts: 0 }));
  },
});

// syncSubscribeAddress: subscribe to state updates for an address
// TODO: don't allow duplicate subscriptions
// TODO: check to see if duplicate subscriptions are even a problem...
export const syncSubscribeAddress = createAsyncThunk(
  "sync/subscribeAddress",
  async (address: AddressEntity) => {
    return Electrum.subscribeToAddress(address);
  }
);

// syncChangeAddress: ensure a change address is up to date
export const syncChangeAddress = createAsyncThunk(
  "sync/changeAddress",
  async (
    payload: { address: AddressEntity; latestIndex: number },
    thunkApi
  ) => {
    const { address, latestIndex } = payload;

    // only rescan last 1000 change addresses
    if (address.state === null || address.hd_index < latestIndex - 1000) {
      const addressState = await Electrum.requestAddressState(address.address);

      thunkApi.dispatch(syncAddressUpdate([address.address, addressState]));
    }
  }
);

// syncAddressUpdate: fired when data acquired from address subscription
export const syncAddressUpdate = createAction("sync/addressUpdate");
syncMiddleware.startListening({
  actionCreator: syncAddressUpdate,
  effect: async (action, listenerApi) => {
    // initial subscription response doesn't have address for context
    if (!Array.isArray(action.payload)) {
      return;
    }

    // get subscription response data from payload
    const [address, addressState] = action.payload;

    // check downloaded state against local state
    const wallet = selectActiveWallet(listenerApi.getState());
    const AddressManager = AddressManagerService(wallet);
    if (AddressManager.updateAddressState(address, addressState)) {
      // if state updated, get utxos for address
      //Logger.debug("address state changed for", address, addressState);
      listenerApi.dispatch(syncAddressUtxos(address));
    }
  },
});

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address) => {
    // we will always need the up-to-date utxo set
    const utxos = await Electrum.requestUtxos(address);
    return {
      address,
      utxos,
    };
  }
);
syncMiddleware.startListening({
  actionCreator: syncAddressUtxos.fulfilled,
  effect: async (action, listenerApi) => {
    const { utxos, address } = action.payload;
    const wallet = selectActiveWallet(listenerApi.getState());

    const AddressManager = AddressManagerService(wallet);
    const UtxoManager = UtxoManagerService(wallet);

    // we need to delete our knowledge of UTXO set
    // in case some utxos were spent elsewhere
    // i.e. wallet seed shared on multiple devices
    UtxoManager.discardAddressUtxos(address);

    // register each UTXO, add tx to history
    utxos.forEach((utxo) => {
      AddressManager.registerTransaction(address, {
        tx_hash: utxo.tx_hash,
        height: utxo.height,
      });

      UtxoManager.registerUtxo(address, utxo);

      /*
      listenerApi.dispatch(syncBlock(utxo.height));
      listenerApi.dispatch(syncTxRequest(utxo.tx_hash));
      */
    });

    // use local tx history to calculate expected state hash
    // if different than response hash, we must be missing transactions
    // ask for entire history of address if so
    const calculatedAddressState =
      AddressManager.calculateAddressState(address);
    const storedAddressState = AddressManager.getAddressState(address);

    // UTXO set represents tip of addresses.
    // If we're still out of sync after applying tip, we must be missing txes
    if (calculatedAddressState !== storedAddressState) {
      listenerApi.dispatch(syncAddressHistory(address));
    }

    // calculate address balance
    const addressBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const balances = AddressManager.updateAddressBalance(
      address,
      addressBalance
    );

    // update wallet balance; view re-renders on wallet update
    listenerApi.dispatch(walletBalanceUpdate(balances));
  },
});

export const syncAddressHistory = createAsyncThunk(
  "sync/addressHistory",
  async (address, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());

    const AddressManager = AddressManagerService(wallet);

    const history = await Electrum.requestAddressHistory(address);
    history.forEach(({ tx_hash, height }) => {
      AddressManager.registerTransaction(address, { tx_hash, height });
      thunkApi.dispatch(syncTxRequest(tx_hash));

      // if (height > listenerApi.getState().sync.chaintip.height - 12960) {
      // }
    });
    return history;
  }
);

export const syncTxRequest = createAsyncThunk(
  "sync/txRequest",
  async (tx_hash, thunkApi) => {
    const TransactionManager = TransactionManagerService();
    const tx = await TransactionManager.resolveTransaction(tx_hash);
    thunkApi.dispatch(syncTxAmount(tx));
    return tx;
  }
);

export const syncTxAmount = createAsyncThunk(
  "sync/txAmount",
  async (tx, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const { localCurrency } = selectCurrencySettings(thunkApi.getState());
    const result = await TransactionHistoryService(
      wallet
    ).calculateAndUpdateTransactionAmount(tx, localCurrency);
    return result;
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

// TODO: keep last 4032 blocks (28 days)
export const syncChaintip = createAction("sync/chaintip");
syncMiddleware.startListening({
  actionCreator: syncChaintip,
  effect: async (action, listenerApi) => {
    const chaintip = action.payload;
    Logger.log("sync/chaintip", chaintip);
    listenerApi.dispatch(syncBlock(chaintip.height));
    //listenerApi.dispatch(fetchExchangeRates());

    await TransactionManagerService().purgeTransactions();
    await BlockchainService().purgeBlocks();
  },
});

const initialPending = {
  utxo: 0,
  history: 0,
  txData: 0,
  txAmount: 0,
};
const initialState = {
  connected: false,
  server: "",
  syncPending: { ...initialPending },
  syncFailed: { ...initialPending },
  chaintip: { ...block_checkpoints.first2023 },
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnectionUp, (state: RootState, action) => {
      state.connected = true;
      state.server = action.payload;
    })
    .addCase(syncConnectionDown, (state: RootState) => {
      state.connected = false;
    })
    .addCase(syncReconnect.pending, (state: RootState) => {
      state.connected = false;
    })
    .addCase(syncAddressUtxos.pending, (state: RootState) => {
      state.syncPending.utxo += 1;
    })
    .addCase(syncAddressUtxos.fulfilled, (state: RootState) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressUtxos.rejected, (state: RootState) => {
      state.syncPending.utxo -= 1;
      state.syncFailed.utxo += 1;
    })
    .addCase(syncAddressHistory.pending, (state: RootState) => {
      state.syncPending.history += 1;
    })
    .addCase(syncAddressHistory.fulfilled, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(syncAddressHistory.rejected, (state: RootState) => {
      state.syncPending.history -= 1;
      state.syncFailed.history += 1;
    })
    .addCase(syncTxRequest.pending, (state: RootState) => {
      state.syncPending.txData += 1;
    })
    .addCase(syncTxRequest.fulfilled, (state: RootState) => {
      state.syncPending.txData -= 1;
    })
    .addCase(syncTxRequest.rejected, (state: RootState) => {
      state.syncPending.txData -= 1;
      state.syncFailed.txData += 1;
    })
    .addCase(syncTxAmount.pending, (state: RootState) => {
      state.syncPending.txAmount += 1;
    })
    .addCase(syncTxAmount.fulfilled, (state: RootState) => {
      state.syncPending.txAmount -= 1;
    })
    .addCase(syncTxAmount.rejected, (state: RootState) => {
      state.syncPending.txAmount -= 1;
      state.syncFailed.txAmount += 1;
    })
    .addCase(syncChaintip, (state, action) => {
      const { hex, height } = action.payload;
      state.chaintip = {
        blockhash: BlockchainService().calculateBlockhash(hex),
        header: hex,
        height,
      };
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
  })
);

/*
const mergeUtxoMerkle = (utxo, merkle) => ({
  ...utxo,
  height: utxo.height === merkle.block_height ? utxo.height : null,
  merkle: merkle.merkle,
  block_pos: merkle.pos,
});
*/
