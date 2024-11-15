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
import { txHistoryFetch } from "@/redux/txHistory";
import { selectNetworkStatus } from "@/redux/device";

import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import WalletManagerService from "@/services/WalletManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
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
    let isSuccess = false;
    try {
      const sync = selectSyncState(thunkApi.getState());

      if (!sync.isConnected || sync.server !== payload.server) {
        Log.debug("syncConnect", sync);
        await Electrum.connect(payload.server);
      } else {
        thunkApi.dispatch(syncWalletAddresses());
      }

      isSuccess = true;
    } catch (e) {
      Log.error(e);
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
        const newServer = Electrum.selectFallbackServer(payload.server);
        thunkApi.dispatch(syncConnect({ server: newServer, attempts: 0 }));
      }
    }

    return isSuccess;
  }
);

// syncReconnect: attempt fresh connection to server
export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (server: string | undefined, thunkApi) => {
    const connectServer = server || Electrum.getElectrumHost();
    thunkApi.dispatch(syncConnect({ attempts: 0, server: connectServer }));
  }
);

// syncConnectionUp: fired when electrum connection is up
export const syncConnectionUp = createAsyncThunk(
  "sync/up",
  async (server: string, thunkApi): Promise<string> => {
    // set up subscriptions on connect
    await Electrum.subscribeToChaintip();
    thunkApi.dispatch(syncWalletAddresses());

    return server;
  }
);

// syncConnectionDown: fired if electrum connection goes down
export const syncConnectionDown = createAsyncThunk("sync/down", async () => {
  // attempt reconnect when connection goes down
  //thunkApi.dispatch(syncReconnect());
});

// syncWalletAddresses: generate wallet addresses and set up subscriptions
export const syncWalletAddresses = createAsyncThunk(
  "sync/walletAddresses",
  async (payload, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);
    const AddressScanner = AddressScannerService(wallet);

    AddressScanner.populateAddresses();

    const addresses = AddressManager.getReceiveAddresses();
    thunkApi.dispatch(syncSubscriptionCount(addresses.length));

    Promise.all(
      addresses.map(async (address) => {
        await Electrum.subscribeToAddress(address);
        thunkApi.dispatch(syncSubscriptionCount(-1));
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
        await Electrum.subscribeToAddress(address);
        thunkApi.dispatch(syncSubscriptionCount(-1));
      });

    thunkApi.dispatch(syncSubscriptionCount(promises.length));

    const batchedPromises = [];
    const batch_chunk_size = 1024;

    while (promises.length > 0) {
      batchedPromises.concat(promises.slice(0, batch_chunk_size));
      promises.splice(0, batch_chunk_size);
    }

    batchedPromises.forEach((batch) => Promise.all(batch));
  }
);

export const syncSubscriptionCount = createAction<number>(
  "sync/subscriptionCount"
);

// syncAddressState: fired when data acquired from address subscription
export const syncAddressState = createAsyncThunk(
  "sync/addressState",
  async (
    payload: [AddressEntity, string | null],
    thunkApi
  ): Promise<[AddressEntity, string | null]> => {
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
      await AddressScanner.scanHistory(address);
    }
  }
);

// save wallet when sync is complete
syncMiddleware.startListening({
  actionCreator: syncAddressHistory.fulfilled,
  effect: async (action, listenerApi) => {
    if (selectSyncState(listenerApi.getState()).syncPending.history <= 1) {
      listenerApi.dispatch(syncPopulateAddresses());

      const wallet = selectActiveWallet(listenerApi.getState());
      await WalletManagerService().saveWallet(wallet.walletHash);
    }
  },
});

export const syncPopulateAddresses = createAsyncThunk(
  "sync/populateAddresses",
  async (action, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressScanner = AddressScannerService(wallet);

    const generatedAddresses = AddressScanner.populateAddresses();

    await Promise.all(
      generatedAddresses.map((address) => Electrum.subscribeToAddress(address))
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

export const syncChaintip = createAsyncThunk(
  "sync/chaintip",
  async (chaintip: { height: number; hex: string }) => {
    const Blockchain = BlockchainService();
    const block = await Blockchain.resolveBlockByHeight(chaintip.height);

    Log.log("sync/chaintip", block);

    return block;
  }
);

export const syncClearAddresses = createAction("sync/clearAddresses");

const initialPending = {
  utxo: 0,
  history: 0,
  addressState: 0,
  subscription: 0,
  chaintip: 0,
  rebuild: 0,
};
const initialState = {
  isConnected: false,
  server: "",
  syncPending: { ...initialPending },
  chaintip: {
    ...block_checkpoints.first2023,
  },
  addresses: {},
  lastRefresh: Date.now(),
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnect.fulfilled, (state, action) => {
      state.isConnected = action.payload;
    })
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
      state.syncPending.addressState += 1;
    })
    .addCase(syncAddressState.fulfilled, (state: RootState, action) => {
      const [address] = action.payload;
      state.addresses[address.address] = address;
      state.syncPending.addressState -= 1;
    })
    .addCase(syncAddressState.rejected, (state: RootState) => {
      state.syncPending.addressState -= 1;
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
    .addCase(syncSubscriptionCount, (state, action) => {
      state.syncPending.subscription += action.payload;
    })
    .addCase(syncChaintip.pending, (state) => {
      state.syncPending.chaintip += 1;
    })
    .addCase(syncChaintip.fulfilled, (state, action) => {
      state.syncPending.chaintip -= 1;
      state.chaintip = action.payload;
    })
    .addCase(syncHotRefresh.fulfilled, (state: RootState, action) => {
      state.lastRefresh = action.payload;
    })
    .addCase(syncClearAddresses, (state) => {
      state.addresses = initialState.addresses;
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

export const selectChaintip = createSelector(
  (state) => state.sync,
  (sync) => sync.chaintip
);

/*
const mergeUtxoMerkle = (utxo, merkle) => ({
  ...utxo,
  height: utxo.height === merkle.block_height ? utxo.height : null,
  merkle: merkle.merkle,
  block_pos: merkle.pos,
});
*/
