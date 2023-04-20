import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { walletBalanceUpdate } from "@/redux/wallet";

import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionHistoryService from "@/services/TransactionHistoryService";

import { block_checkpoints } from "@/util/block_checkpoints";

const Electrum = new ElectrumService();

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request/retry electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (attempts = 0, thunkApi) => {
    try {
      await Electrum.connect();
    } catch (e) {
      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);
      setTimeout(() =>
        thunkApi.dispatch(
          syncConnect(attempts + 1),
          Math.min(Math.pow(1000 * attempts, 2), 30 * 1000) // exponential backoff up to 30 seconds
        )
      );
    }
  }
);

export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (_, thunkApi) => {
    await Electrum.disconnect(true);
    thunkApi.dispatch(syncConnect());
  }
);

// syncConnectionUp: fired when electrum connection is up
// set up electrum subscriptions to all receive addresses
export const syncConnectionUp = createAction("sync/up");
syncMiddleware.startListening({
  actionCreator: syncConnectionUp,
  effect: async (action, listenerApi) => {
    // set up subscriptions on connect
    const AddressManager = new AddressManagerService(
      listenerApi.getState().wallet.id
    );
    const addresses = [
      ...AddressManager.getReceiveAddresses(),
      ...AddressManager.getChangeAddresses(),
    ];
    addresses.forEach(({ address }) =>
      listenerApi.dispatch(syncSubscribeAddress(address))
    );

    Electrum.subscribeToChaintip();
  },
});

// syncConnectionDown: fired if electrum connection goes down
// destroy electrum connection and reissue syncConnect action
export const syncConnectionDown = createAction("sync/down");
syncMiddleware.startListening({
  actionCreator: syncConnectionDown,
  effect: async (action, listenerApi) => {
    // cleanup electrum subscriptions (force=true)
    Electrum.disconnect(true);
    // we'll handle reconnecting ourselves
    listenerApi.dispatch(syncConnect());
  },
});

// syncSubscribeAddress: subscribe to state updates for an address
// TODO: don't allow duplicate subscriptions
export const syncSubscribeAddress = createAsyncThunk(
  "sync/subscribeAddress",
  async (address, thunkApi) => {
    return await Electrum.subscribeToAddress(address);
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
    const AddressManager = new AddressManagerService(
      listenerApi.getState().wallet.id
    );
    if (AddressManager.updateAddressState(address, addressState)) {
      // if state updated, get utxos for address
      console.log("address state changed for", address);
      listenerApi.dispatch(syncAddressUtxos(address));
    }
  },
});

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address, thunkApi) => {
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
    const wallet_id = listenerApi.getState().wallet.id;

    const AddressManager = new AddressManagerService(wallet_id);

    // register each UTXO, add tx to history
    utxos.forEach((utxo) => {
      AddressManager.registerTransaction(address, {
        tx_hash: utxo.tx_hash,
        height: utxo.height,
      });

      listenerApi.dispatch(syncBlock(utxo.height));
      listenerApi.dispatch(syncTxRequest(utxo.tx_hash));
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
      console.log(
        "missing transactions? attempting sync...",
        calculatedAddressState,
        address,
        storedAddressState
      );

      const history = await Electrum.requestAddressHistory(address);
      history.forEach(({ tx_hash, height }) => {
        AddressManager.registerTransaction(address, { tx_hash, height });
        listenerApi.dispatch(syncTxRequest(tx_hash));
      });
    }

    // calculate address balance
    const addressBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const walletBalance = AddressManager.updateAddressBalance(
      address,
      addressBalance
    );

    // update wallet balance; view re-renders on wallet update
    listenerApi.dispatch(walletBalanceUpdate(walletBalance));
  },
});

export const syncTxRequest = createAsyncThunk(
  "sync/txRequest",
  async (tx_hash, thunkApi) => {
    const TransactionManager = new TransactionManagerService();
    const tx = await TransactionManager.resolveTransaction(tx_hash);
    thunkApi.dispatch(syncTxAmount(tx));
    return tx;
  }
);

export const syncTxAmount = createAsyncThunk(
  "sync/txAmount",
  async (tx, thunkApi) => {
    const wallet_id = thunkApi.getState().wallet.id;
    await new TransactionHistoryService(
      wallet_id
    ).calculateAndUpdateTransactionAmount(tx);
    return wallet_id;
  }
);

export const syncBlock = createAsyncThunk(
  "sync/block",
  async (height, thunkApi) => {
    const Blockchain = new BlockchainService();
    let block = Blockchain.getBlockByHeight(height);

    if (block === null || block.header === null) {
      const header = await Electrum.requestBlock(height);
      Blockchain.registerBlock({ header, height });
      block = Blockchain.getBlockByHeight(height);
    }

    console.log("sync/block", block);
    return block;
  }
);

// TODO: keep last 4032 blocks (28 days)
export const syncChaintip = createAction("sync/chaintip");
syncMiddleware.startListening({
  actionCreator: syncChaintip,
  effect: async (action, listenerApi) => {
    const chaintip = action.payload;
    console.log("sync/chaintip", chaintip);
    listenerApi.dispatch(syncBlock(chaintip.height));
  },
});

const initialState = {
  connected: false,
  chaintip: { ...block_checkpoints.first2023 },
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnectionUp, (state, action) => {
      state.connected = true;
    })
    .addCase(syncConnectionDown, (state, action) => {
      state.connected = false;
    })
    .addCase(syncReconnect.pending, (state, action) => {
      state.connected = false;
    })
    .addCase(syncChaintip, (state, action) => {
      const { hex, height } = action.payload;
      state.chaintip = {
        blockhash: new BlockchainService().calculateBlockhash(hex),
        header: hex,
        height: height,
      };
    });
});

export const selectSyncState = createSelector(
  (state) => state,
  (state) => state.sync
);

/*
const mergeUtxoMerkle = (utxo, merkle) => ({
  ...utxo,
  height: utxo.height === merkle.block_height ? utxo.height : null,
  merkle: merkle.merkle,
  block_pos: merkle.pos,
});
*/
