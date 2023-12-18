/* eslint-disable @typescript-eslint/no-use-before-define */
import Logger from "js-logger";
import Decimal from "decimal.js";
import { SplashScreen } from "@capacitor/splash-screen";
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

import { ValidBchNetwork } from "@/util/crypto";

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import ToastService from "@/services/ToastService";

export const walletMiddleware = createListenerMiddleware();

const initialState = {
  id: 0,
  balance: 0,
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
    Logger.debug("walletBoot", wallet_id, wallet, network);

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

    return wallet;
  }
);

// walletReload: reload currently active wallet from database
export const walletReload = createAction("wallet/reload", () => {
  return { payload: initialState };
});

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

// hide splash screen when wallet is loaded
walletMiddleware.startListening({
  actionCreator: walletBoot.fulfilled,
  effect: async () => {
    await SplashScreen.hide();
  },
});

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const wallet = action.payload;
      return wallet;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload.currentBalance;
    })
    .addCase(walletReload, (state, action) => {
      const wallet = WalletManagerService().getWalletById(state.id);
      return { ...action.payload, ...wallet };
    });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state.wallet,
  (wallet): WalletEntity => wallet
);
