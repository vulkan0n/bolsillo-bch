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
import { syncConnect } from "@/redux/sync";

import { ValidBchNetwork } from "@/util/crypto";

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import ElectrumService from "@/services/ElectrumService";

import ToastService from "@/services/ToastService";

export const walletMiddleware = createListenerMiddleware();

const initialState = {
  id: 0,
  balance: 0,
  name: "Wallet",
  key_viewed: "",
  nonce: 0,
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
    const wallet = WalletManagerService(network).boot(wallet_id);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletId", value: wallet.id.toString() })
    );

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

export const walletBalanceUpdate = createAction(
  "wallet/balanceUpdate",
  (payload: { wallet: WalletEntity; isChange: boolean }) => {
    const { wallet, isChange } = payload;

    // address and wallet balances are automatically derived on SQL layer when UTXO entries are updated
    const sqlWallet = WalletManagerService(wallet.network).getWalletById(
      wallet.id
    );

    const previousBalance = wallet.balance;
    const currentBalance = sqlWallet.balance;

    // show receive notification
    if (currentBalance > previousBalance && isChange === false) {
      const difference = currentBalance - previousBalance;
      ToastService().paymentReceived(difference);
    }

    return { payload: currentBalance };
  }
);

export const walletSetName = createAction(
  "wallet/name",
  (payload: { wallet: WalletEntity; name: string }) => {
    WalletManagerService(payload.wallet.network).setWalletName(
      payload.wallet.id,
      payload.name
    );
    return { payload };
  }
);

export const walletSetKeyViewed = createAction(
  "wallet/key_viewed",
  (payload: { wallet: WalletEntity }) => {
    const key_viewed = WalletManagerService(
      payload.wallet.network
    ).updateKeyViewed(payload.wallet.id);

    return { payload: key_viewed };
  }
);

export const walletNonce = createAction("wallet/nonce");

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const wallet = action.payload;
      return wallet;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload;
    })
    .addCase(walletSetName, (state, action) => {
      if (state.id === action.payload.wallet.id) {
        state.name = action.payload.name;
      }
    })
    .addCase(walletSetKeyViewed, (state, action) => {
      state.key_viewed = action.payload;
    })
    .addCase(walletNonce, (state) => {
      state.nonce += 1;
    });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state,
  (state) => state.wallet
);
