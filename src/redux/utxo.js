import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { walletBalanceUpdate } from "@/redux/wallet";

import ElectrumService from "@/services/ElectrumService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionService from "@/services/TransactionService";

const Electrum = new ElectrumService();

export const utxoRequest = createAsyncThunk(
  "utxo/request",
  async (address, thunkApi) => {
    const utxos = await Electrum.requestUtxos(address);

    // calculate address balance
    const addressManager = new AddressManagerService();
    const addressBalance = utxos.reduce((sum, cur) => sum + cur.value, 0);
    const walletBalance = addressManager.updateAddressBalance(
      address,
      addressBalance
    );
    thunkApi.dispatch(walletBalanceUpdate(walletBalance));

    // sync related transactions for utxo
    const txService = new TransactionService();
    utxos.forEach(async ({ tx_hash }) => {
      let tx = txService.getTransactionByHash(tx_hash);

      if (tx === null) {
        tx = await Electrum.requestTransaction(tx_hash);
        txService.registerTransaction(tx, address);
      }
    });

    console.log("utxoRequest", address, utxos);

    return { address, utxos };
  }
);

const initialState = {};

export const utxoReducer = createReducer(initialState, (builder) => {
  builder.addCase(utxoRequest.fulfilled, (state, action) => {
    state[action.payload.address] = action.payload.utxos;
  });
});

export const selectUtxos = createSelector(
  (state) => state,
  (state) => state.utxos
);
