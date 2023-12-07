/* eslint-disable @typescript-eslint/no-use-before-define */
import Logger from "js-logger";
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

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import { ValidBchNetwork } from "@/util/crypto";

/*
import Decimal from "decimal.js";
import { formatSatoshis } from "@/util/sats";
import showToast from "@/util/toast";
import { logos } from "@/util/logos";
*/

export const walletMiddleware = createListenerMiddleware();

// --------------------------------

// walletBoot: loads wallet by wallet_id and initializes Electrum connection
export const walletBoot = createAsyncThunk(
  "wallet/boot",
  async (
    payload: {
      wallet: WalletEntity;
      addresses: string[];
      wallet_id: number;
      network: ValidBchNetwork;
    },
    thunkApi
  ) => {
    const { wallet_id, network } = payload;
    // load Wallet from database
    const wallet = WalletManagerService().boot(wallet_id, network);
    Logger.log("walletBoot", wallet_id, wallet, network);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletId", value: wallet.id.toString() })
    );

    const AddressManager = AddressManagerService(wallet);
    const addresses = AddressManager.populateAddresses();

    const isChipnet = network === "chipnet";

    const server = isChipnet
      ? ElectrumService().selectFallbackServer(null, true)
      : selectElectrumServer(thunkApi.getState());

    thunkApi.dispatch(
      syncConnect({
        attempts: 0,
        server,
      })
    );

    await SplashScreen.hide();

    return { wallet, addresses };
  }
);

// walletReload: reload currently active wallet from database
export const walletReload = createAction("wallet/reload", () => {
  return { payload: { id: 0, balance: 0 } };
});

export const walletBalanceUpdate = createAction(
  "wallet/balanceUpdate",
  (payload) => ({
    payload: {
      previousBalance: payload.previousBalance,
      currentBalance: payload.currentBalance,
      isChange: payload.isChange,
    },
  })
);
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
    /*
    const { previousBalance, walletBalance, isChange } = action.payload;
    if (walletBalance > previousBalance && isChange === 0) {
      const difference = formatSatoshis(
        new Decimal(walletBalance).minus(previousBalance)
      );

      showToast({
        icon: (
          <img
            src={logos.selene.img}
            style={{ width: "64px", height: "64px" }}
            alt=""
          />
        ),
        title: "Payment received!",
        description: `+${difference.bch}`,
      });
    }
    */
  },
});

const initialState = {
  id: 0,
  balance: 0,
};

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const { wallet } = action.payload;
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
