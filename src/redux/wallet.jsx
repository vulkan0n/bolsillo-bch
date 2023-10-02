/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import Decimal from "decimal.js";
import {
  setPreference,
  selectElectrumServer,
  selectIsChipnet,
} from "@/redux/preferences";
import { syncConnect, syncSubscribeAddress } from "@/redux/sync";

import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import { formatSatoshis } from "@/util/sats";
import showToast from "@/util/toast";
import { logos } from "@/util/logos";

export const walletMiddleware = createListenerMiddleware();

// --------------------------------

// walletBoot : initialize/load wallet from preferences.activeWalletId
export const walletBoot = createAction("wallet/boot", (wallet_id) => {
  const wallet = WalletService().boot(wallet_id);
  return { payload: wallet };
});
walletMiddleware.startListening({
  actionCreator: walletBoot,
  effect: async (action, listenerApi) => {
    //console.log("walletBoot", action.payload);
    listenerApi.dispatch(
      setPreference({ key: "activeWalletId", value: action.payload.id })
    );
    // connect to electrum
    const isChipnet = selectIsChipnet(listenerApi.getState());
    const server = isChipnet
      ? ElectrumService().selectFallbackServer()
      : selectElectrumServer(listenerApi.getState());

    listenerApi.dispatch(
      syncConnect({
        server,
        attempts: 0,
      })
    );
  },
});

export const walletReload = createAction("wallet/reload");

export const walletBalanceUpdate = createAction("wallet/balanceUpdate");
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
    const { previousBalance, walletBalance, change } = action.payload;
    if (walletBalance > previousBalance && change === 0) {
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
  },
});

const initialState = {
  id: null,
  balance: 0,
};

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot, (state, action) => {
      return action.payload;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload.walletBalance;
    })
    .addCase(walletReload, (state) => {
      return WalletService().getWalletById(state.id);
    });
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);
