/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { setPreference, selectElectrumServer } from "@/redux/preferences";
import { syncConnect, syncSubscribeAddress } from "@/redux/sync";
import { fetchExchangeRates } from "@/redux/exchangeRates";

import { ValidBchNetwork } from "@/util/crypto";

import WalletManagerService from "@/services/WalletManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import ToastService from "@/services/ToastService";

export const walletMiddleware = createListenerMiddleware();

const initialState = {
  id: 0,
  balance: 0,
  name: "Wallet",
  key_viewed: "",
};

// --------------------------------

// walletBoot: loads wallet by wallet_id and initializes Electrum connection
export const walletBoot = createAsyncThunk(
  "wallet/boot",
  async (
    payload: { wallet_id: number; network: ValidBchNetwork },
    thunkApi
  ) => {
    const { wallet_id, network } = payload;
    // load Wallet from database
    const wallet = WalletManagerService().boot(wallet_id, network);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletId", value: wallet.id.toString() })
    );

    const AddressManager = AddressManagerService(wallet);
    AddressManager.populateAddresses();

    const isChipnet = network === "chipnet";

    const server = isChipnet
      ? ElectrumService().selectFallbackServer(null, true)
      : selectElectrumServer(thunkApi.getState());

    // connect to Electrum
    thunkApi.dispatch(
      syncConnect({
        attempts: 0,
        server,
      })
    );

    thunkApi.dispatch(fetchExchangeRates(0));

    return wallet;
  }
);

export const walletBalanceUpdate = createAction<{
  previousBalance: number;
  currentBalance: number;
  isChange: boolean;
}>("wallet/balanceUpdate");

walletMiddleware.startListening({
  actionCreator: walletBalanceUpdate,
  effect: async (action, listenerApi) => {
    const wallet = selectActiveWallet(listenerApi.getState());
    const AddressManager = AddressManagerService(wallet);

    // generate new addresses when address state updates
    const generatedAddresses = AddressManager.populateAddresses();

    // subscribe to the new addresses
    generatedAddresses.forEach((address) =>
      listenerApi.dispatch(syncSubscribeAddress(address))
    );

    // show receive notification
    const { previousBalance, currentBalance, isChange } = action.payload;
    if (currentBalance > previousBalance && isChange === false) {
      const difference = currentBalance - previousBalance;
      ToastService().paymentReceived(difference);
    }
  },
});

export const walletSetName = createAction(
  "wallet/name",
  (payload: { wallet_id: number; name: string }) => {
    WalletManagerService().setWalletName(payload.wallet_id, payload.name);

    return { payload: payload.name };
  }
);

export const walletSetKeyViewed = createAction(
  "wallet/key_viewed",
  (payload: { wallet_id: number }) => {
    const key_viewed = WalletManagerService().updateKeyViewed(
      payload.wallet_id
    );

    return { payload: key_viewed };
  }
);

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const wallet = action.payload;
      return wallet;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload.currentBalance;
    })
    .addCase(walletSetName, (state, action) => {
      state.name = action.payload;
    })
    .addCase(walletSetKeyViewed, (state, action) => {
      state.key_viewed = action.payload;
    });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state,
  (state) => state.wallet
);
