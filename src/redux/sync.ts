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
  selectActiveWalletHash,
  selectActiveWallet,
  walletReloadAddresses,
} from "@/redux/wallet";
import { txHistoryFetch } from "@/redux/txHistory";
import { selectNetworkStatus } from "@/redux/device";
import { selectIsOfflineMode } from "@/redux/preferences";

import LogService from "@/services/LogService";
import ElectrumService, {
  ElectrumVersionMismatchError,
} from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import WalletManagerService from "@/services/WalletManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import JanitorService from "@/services/JanitorService";

const Log = LogService("redux/sync");

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request/retry electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (payload: { attempts: number; server: string }, thunkApi) => {
    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.log("sync/connect blocked by offline mode");
      return false;
    }

    const Electrum = ElectrumService();

    Log.log("sync/connect", payload);
    let isSuccess = false;
    try {
      await Electrum.connect(payload.server);
      isSuccess = true;
    } catch (e) {
      Log.error("syncConnect:", e);

      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);

      // try a different server if there's a protocol version mismatch
      const isProtocolVersionMismatch =
        e instanceof ElectrumVersionMismatchError;

      // try multiple servers only if device reports active network connection
      const { isConnected: isNetworkConnected } = selectNetworkStatus(
        thunkApi.getState()
      );

      // attempt to connect 3 times before failover
      const shouldFailover =
        isNetworkConnected &&
        (isProtocolVersionMismatch || payload.attempts > 2);

      if (shouldFailover) {
        // try a different server
        const newServer = Electrum.selectFallbackServer(payload.server);
        thunkApi.dispatch(syncConnect({ server: newServer, attempts: 0 }));
      } else if (payload.attempts < 5) {
        setTimeout(
          () =>
            thunkApi.dispatch(
              syncConnect({ ...payload, attempts: payload.attempts + 1 })
            ),
          Math.min(1000 * (payload.attempts + 1) * 2, 10 * 1000)
        );
      } else {
        thunkApi.dispatch(syncDisconnect());
      }
    }

    return isSuccess;
  }
);

// syncReconnect: attempt fresh connection to server
export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (server: string | undefined, thunkApi) => {
    const Electrum = ElectrumService();
    const connectServer = server || Electrum.getElectrumHost();
    Log.debug("reconnect:", connectServer);
    thunkApi.dispatch(syncConnect({ attempts: 0, server: connectServer }));
  }
);

export const syncDisconnect = createAsyncThunk("sync/disconnect", async () => {
  const Electrum = ElectrumService();
  return Electrum.disconnect(true);
});

// syncConnectionUp: fired when electrum connection is up
export const syncConnectionUp = createAsyncThunk(
  "sync/up",
  async (payload, thunkApi) => {
    const Electrum = ElectrumService();
    // set up subscriptions on connect
    try {
      Electrum.subscribeToChaintip();
      thunkApi.dispatch(syncSubscriptions());
      Log.debug("syncConnectionUp");
    } catch (e) {
      Log.warn("syncConnectionUp:", e);
    }

    return Electrum.getElectrumHost();
  }
);

// syncConnectionDown: fired if electrum connection goes down
export const syncConnectionDown = createAction("sync/down");

export const syncSubscriptions = createAsyncThunk(
  "sync/subscriptions",
  async (payload, thunkApi) => {
    const walletHash = selectActiveWalletHash(thunkApi.getState());

    const AddressManager = AddressManagerService(walletHash);
    const UtxoManager = UtxoManagerService(walletHash);

    // "hot" addresses are any addresses with UTXOs on them
    // if any address has a utxo, we'll get notified on spend,
    // then no longer subscribe going forward
    // if a change address has state but no utxo, we assume the address is spent
    // so no need to subscribe.
    const walletUtxos = UtxoManager.getWalletUtxos();
    const hotAddresses = walletUtxos.reduce((acc, utxo) => {
      const a = AddressManager.getAddress(utxo.address);
      return acc.find((f) => f.address === a.address) ? acc : [...acc, a];
    }, []);

    // we should subscribe to all unused receive addresses
    const unusedReceiveAddresses = AddressManager.getUnusedAddresses(0, 0);

    // we should subscribe to addresses with n > 2 transactions in history
    // these may be donation addresses or some other static payment address
    const reusedReceiveAddresses = AddressManager.getReusedAddresses();

    // we should subscribe to a few unused change addresses for instant updates if we spend elsewhere
    const unusedChangeAddresses = AddressManager.getUnusedAddresses(0, 1);
    const filteredUnusedChangeAddresses = unusedChangeAddresses.filter(
      (a, i) => i < 20 || i > unusedChangeAddresses.length - 20
    );

    // subscribe to WalletConnect address
    const walletConnectAddress = AddressManager.getWalletConnectAddress();

    // TODO: allow the user to set up pinned/watch addresses, get address list here

    const addresses = [
      walletConnectAddress,
      ...hotAddresses,
      ...unusedReceiveAddresses,
      ...reusedReceiveAddresses,
      ...filteredUnusedChangeAddresses,
    ]
      // de-duplicate subscription list
      .reduce(
        (acc, cur) =>
          acc.find((f) => f.address === cur.address) ? acc : [...acc, cur],
        []
      );

    Log.debug("syncSubscriptions", addresses.length);

    thunkApi.dispatch(syncSubscriptionCount(addresses.length));

    const Electrum = ElectrumService();

    Promise.all(
      addresses.map(async (address) => {
        try {
          await Electrum.subscribeToAddress(address);
        } catch (e) {
          Log.warn("syncSubscriptions:", e);
        } finally {
          thunkApi.dispatch(syncSubscriptionCount(-1));
        }
      })
    );

    return addresses;
  }
);

export const syncSubscriptionCount = createAction<number>(
  "sync/subscriptionCount"
);

// syncAddressState: fired when data acquired from address subscription
export const syncAddressState = createAsyncThunk(
  "sync/addressState",
  async (
    payload: [string, string | null],
    thunkApi
  ): Promise<[AddressEntity, string | null]> => {
    // get subscription response data from payload
    const [address, addressState] = payload;

    //Log.debug("syncAddressState", payload);

    // catch for payload from direct electrum subscription
    const walletHash = selectActiveWalletHash(thunkApi.getState());
    const AddressManager = AddressManagerService(walletHash);

    const addressObj = AddressManager.getAddress(address);

    // check downloaded state against local state
    if (addressObj.state !== addressState) {
      Log.debug(
        "address state changed for",
        address,
        addressObj.state,
        addressState
      );
      thunkApi.dispatch(syncAddressUtxos(addressObj));
      thunkApi.dispatch(syncAddressHistory([addressObj, addressState]));
    }

    return [addressObj, addressState];
  }
);

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address: AddressEntity, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());

    try {
      //Log.debug("sync/addressUtxos", address.address);
      await AddressScannerService(wallet).scanUtxos(address.address);
    } catch (e) {
      Log.warn("syncAddressUtxos:", e);
    }
  }
);

export const syncAddressHistory = createAsyncThunk(
  "sync/addressHistory",
  async (
    payload: [addressObj: AddressEntity, resolvedState: string | null],
    thunkApi
  ): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressScanner = AddressScannerService(wallet);

    const [addressObj, resolvedState] = payload;
    const [, calculatedState] = await AddressScanner.scanHistory(addressObj);

    // we shouldn't ever hit this path as of 2025.06.04. keep monitoring for now
    if (calculatedState !== resolvedState) {
      Log.warn("???", addressObj, calculatedState, resolvedState);
    }
  }
);

export const syncPopulateAddresses = createAsyncThunk(
  "sync/populateAddresses",
  async (action, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressScanner = AddressScannerService(wallet);

    const generatedAddresses = AddressScanner.populateAddresses();
    thunkApi.dispatch(syncSubscriptionCount(generatedAddresses.length));

    const Electrum = ElectrumService();
    await Promise.all(
      generatedAddresses.map(async (address) => {
        try {
          await Electrum.subscribeToAddress(address);
        } catch (e) {
          Log.warn("syncPopulateAddresses", e);
        } finally {
          thunkApi.dispatch(syncSubscriptionCount(-1));
        }
      })
    );

    return generatedAddresses;
  }
);

export const syncHotRefresh = createAsyncThunk(
  "sync/hotRefresh",
  async (payload: { force: boolean }, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const sync = selectSyncState(thunkApi.getState());

    // only allow hot sync after cooldown
    const hotSyncCooldown = 3 * 1000;

    if (
      (sync.isSyncComplete &&
        sync.syncPending.hotRefresh <= 1 &&
        sync.lastRefresh < Date.now() - hotSyncCooldown) ||
      payload.force
    ) {
      const AddressManager = AddressManagerService(wallet.walletHash);

      // get all receive addresses
      const receiveAddresses = AddressManager.getReceiveAddresses();

      // don't resync unused receive addresses (we're already subscribed to them)
      const filteredReceiveAddresses = receiveAddresses.filter(
        (address) => !(address.state === null)
      );

      // get all change addresses
      const changeAddresses = AddressManager.getChangeAddresses();

      // don't resync fully spent change addresses
      const filteredChangeAddresses = changeAddresses.filter(
        (address) => !(address.state !== null && address.balance === 0)
      );

      // concatenate full list of addresses
      const addresses = filteredReceiveAddresses.concat(
        filteredChangeAddresses
      );

      thunkApi.dispatch(syncSubscriptionCount(addresses.length));
      Log.debug("hotRefresh", addresses.length);

      const Electrum = ElectrumService();
      await Promise.all(
        addresses.map(async (address) => {
          try {
            const addressState = await Electrum.requestAddressState(
              address.address
            );
            await thunkApi.dispatch(
              syncAddressState([address.address, addressState])
            );
          } catch (e) {
            Log.warn("syncHotRefresh:", e);
          } finally {
            thunkApi.dispatch(syncSubscriptionCount(-1));
          }
        })
      );

      const AddressScanner = AddressScannerService(wallet);
      const nScanMore = 500;
      await Promise.all([
        AddressScanner.scanMoreAddresses(nScanMore, 0),
        AddressScanner.scanMoreAddresses(nScanMore, 1),
      ]);

      await thunkApi.dispatch(syncPopulateAddresses());

      Log.debug("sync/hotRefresh", sync);
      return Date.now();
    }

    Log.debug(
      "skipped hotRefresh",
      sync.isSyncComplete,
      sync.lastRefresh,
      Date.now() - hotSyncCooldown,
      sync.lastRefresh < Date.now() - hotSyncCooldown
    );
    return sync.lastRefresh;
  }
);

export const syncChaintip = createAsyncThunk(
  "sync/chaintip",
  async (chaintip: { height: number; hex: string }) => {
    const Blockchain = BlockchainService();

    const currentTip = await Blockchain.resolveChaintip();

    const tipHash = Blockchain.calculateBlockhash(chaintip.hex);

    // chaintip is up to date
    if (currentTip.blockhash === tipHash) {
      Log.log("sync/chaintip", currentTip.height, currentTip.blockhash);
      return currentTip;
    }

    const block = await Blockchain.resolveBlockByHash(tipHash);

    Log.log("sync/chaintip", block);

    // this requires the app being closed for 10 blocks
    // TODO: actual cron tasking
    if (block.height > currentTip.height + 10) {
      queueMicrotask(async () => {
        const Janitor = JanitorService();
        await Janitor.purgeStaleData();
      });
    }

    return block;
  }
);

export const syncClearAddresses = createAction("sync/clearAddresses");

export const syncSetSaving = createAction<boolean>("sync/saving");

export const syncComplete = createAsyncThunk(
  "sync/complete",
  async (payload, thunkApi) => {
    const { syncCount, isSyncComplete, isSyncing, isSaving } = selectSyncState(
      thunkApi.getState()
    );

    if (!isSyncing && syncCount <= 1) {
      if (!isSyncComplete && !isSaving) {
        requestAnimationFrame(async () => {
          Log.debug("sync complete");
          thunkApi.dispatch(syncSetSaving(true));
          const wallet = selectActiveWallet(thunkApi.getState());

          // update wallet balance; view re-renders on wallet update
          thunkApi.dispatch(
            walletBalanceUpdate({
              wallet,
              isChange: false,
            })
          );

          thunkApi.dispatch(walletReloadAddresses({ wallet }));

          await WalletManagerService().saveWallet(wallet.walletHash);
          thunkApi.dispatch(syncSetSaving(false));
        });
      }
      return true;
    }

    return false;
  }
);
syncMiddleware.startListening({
  actionCreator: syncAddressHistory.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncAddressUtxos.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncChaintip.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncHotRefresh.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: txHistoryFetch.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncPopulateAddresses.fulfilled,
  effect: async (action, listenerApi) => {
    if (action.payload.length > 0) {
      listenerApi.dispatch(syncPopulateAddresses());
    } else {
      listenerApi.dispatch(syncComplete());
    }
  },
});

const initialChaintip = { height: -1, hex: "" };

const initialPending = {
  utxo: 0,
  history: 0,
  addressState: 0,
  subscription: 0,
  chaintip: 0,
  rebuild: 0,
  hotRefresh: 0,
  txHistory: 0,
  populate: 0,
};

interface SyncState {
  isConnected: boolean;
  server: string;
  syncPending: typeof initialPending;
  isSyncComplete: boolean;
  isSaving: boolean;
  chaintip: typeof initialChaintip;
  lastRefresh: number;
  addresses: object;
  subscriptions: Array<AddressEntity>;
}

const initialState: SyncState = {
  isConnected: false,
  server: "",
  syncPending: { ...initialPending },
  isSyncComplete: true,
  isSaving: false,
  chaintip: initialChaintip,
  lastRefresh: Date.now(),
  addresses: {},
  subscriptions: [],
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnect.fulfilled, (state, action) => {
      state.isConnected = action.payload;
    })
    .addCase(syncDisconnect.pending, (state) => {
      state.isConnected = false;
    })
    .addCase(syncDisconnect.fulfilled, (state) => {
      state.isConnected = false;
    })
    .addCase(syncConnectionUp.fulfilled, (state, action) => {
      state.isConnected = true;
      state.server = action.payload;
    })
    .addCase(syncConnectionDown, (state) => {
      state.isConnected = false;
      state.syncPending = initialPending;
    })
    .addCase(syncReconnect.pending, (state) => {
      state.isConnected = false;
    })
    .addCase(syncAddressState.pending, (state) => {
      state.isSyncComplete = false;
      state.syncPending.addressState += 1;
    })
    .addCase(syncAddressState.fulfilled, (state, action) => {
      const [address] = action.payload;
      state.addresses[address.address] = address;
      state.syncPending.addressState -= 1;
    })
    .addCase(syncAddressState.rejected, (state) => {
      state.syncPending.addressState -= 1;
    })
    .addCase(syncAddressUtxos.pending, (state) => {
      state.isSyncComplete = false;
      state.syncPending.utxo += 1;
    })
    .addCase(syncAddressUtxos.fulfilled, (state) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressUtxos.rejected, (state) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressHistory.pending, (state) => {
      state.isSyncComplete = false;
      state.syncPending.history += 1;
    })
    .addCase(syncAddressHistory.fulfilled, (state) => {
      state.syncPending.history -= 1;
    })
    .addCase(syncAddressHistory.rejected, (state) => {
      state.syncPending.history -= 1;
    })
    .addCase(txHistoryFetch.pending, (state) => {
      state.isSyncComplete = false;
      state.syncPending.txHistory += 1;
    })
    .addCase(txHistoryFetch.fulfilled, (state) => {
      state.syncPending.txHistory -= 1;
    })
    .addCase(txHistoryFetch.rejected, (state) => {
      state.syncPending.txHistory -= 1;
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
    .addCase(syncChaintip.rejected, (state) => {
      state.syncPending.chaintip += 1;
    })
    .addCase(syncHotRefresh.pending, (state) => {
      //state.isSyncComplete = false;
      state.syncPending.hotRefresh += 1;
    })
    .addCase(syncHotRefresh.fulfilled, (state, action) => {
      state.lastRefresh = action.payload;
      state.syncPending.hotRefresh -= 1;
    })
    .addCase(syncHotRefresh.rejected, (state) => {
      state.syncPending.hotRefresh -= 1;
    })
    .addCase(syncClearAddresses, (state) => {
      state.addresses = initialState.addresses;
    })
    .addCase(syncSubscriptions.pending, (state) => {
      state.isSyncComplete = false;
    })
    .addCase(syncSubscriptions.fulfilled, (state, action) => {
      state.subscriptions = action.payload;
    })
    .addCase(syncPopulateAddresses.pending, (state) => {
      state.syncPending.populate += 1;
    })
    .addCase(syncPopulateAddresses.fulfilled, (state, action) => {
      state.syncPending.populate -= 1;
      state.subscriptions = [...state.subscriptions, ...action.payload];
    })
    .addCase(syncComplete.fulfilled, (state, action) => {
      state.isSyncComplete = action.payload;
    })
    .addCase(syncSetSaving, (state, action) => {
      state.isSaving = action.payload;
    });
});

export const selectIsSyncing = createSelector(
  (state: RootState) => state.sync,
  (sync) =>
    Object.keys(sync.syncPending).reduce(
      (isSyncing, pending) =>
        sync.syncPending[pending] > 0 || isSyncing || sync.isSaving,
      false
    )
);

export const selectSyncCount = createSelector(
  (state: RootState) => state.sync,
  (sync) =>
    Object.keys(sync.syncPending).reduce(
      (syncCount, pending) => syncCount + sync.syncPending[pending],
      0
    )
);

export const selectSyncState = createSelector(
  (state: RootState) => state.sync,
  (sync) => ({
    ...sync,
    isSyncing: selectIsSyncing({ sync }),
    syncCount: selectSyncCount({ sync }),
  })
);

export const selectChaintip = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.chaintip
);

export const selectElectrumServer = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.server
);

export const selectIsConnected = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.isConnected
);

export const selectSubscriptions = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.subscriptions
);
