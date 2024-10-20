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
import AddressManagerService from "@/services/AddressManagerService";

import ToastService from "@/services/ToastService";
import LogService from "@/services/LogService";

export const walletMiddleware = createListenerMiddleware();

const Log = LogService("redux/wallet");

const initialState = {
  walletHash: "",
  balance: 0,
  name: "-",
  key_viewed: "",
  nonce: 0,
};

// --------------------------------

// walletBoot: loads wallet by walletHash and initializes Electrum connection
export const walletBoot = createAsyncThunk(
  "wallet/boot",
  async (
    payload: { walletHash: string; network: ValidBchNetwork },
    thunkApi
  ) => {
    const { walletHash, network } = payload;

    // load Wallet from database
    const wallet = await WalletManagerService().boot(walletHash);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletHash", value: wallet.walletHash })
    );

    thunkApi.dispatch(walletReloadAddresses({ wallet }));

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

    Log.debug("wallet/boot", wallet);

    return wallet;
  }
);

export const walletBalanceUpdate = createAction(
  "wallet/balanceUpdate",
  (payload: { wallet: WalletEntity; isChange: boolean }) => {
    const { wallet, isChange } = payload;

    // address and wallet balances are automatically derived on SQL layer when UTXO entries are updated
    const sqlWallet = WalletManagerService().getWallet(wallet.walletHash);

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
    WalletManagerService().setWalletName(
      payload.wallet.walletHash,
      payload.name
    );
    return { payload };
  }
);

export const walletSetKeyViewed = createAction(
  "wallet/key_viewed",
  (payload: { wallet: WalletEntity }) => {
    const key_viewed = WalletManagerService().updateKeyViewed(
      payload.wallet.walletHash
    );

    return { payload: key_viewed };
  }
);

export const walletNonce = createAction("wallet/nonce");

export const walletReloadAddresses = createAction(
  "wallet/reloadAddresses",
  (payload: { wallet: WalletEntity }) => {
    const AddressManager = AddressManagerService(payload.wallet);
    const myAddresses = [
      ...AddressManager.getReceiveAddresses(),
      ...AddressManager.getChangeAddresses(),
    ];

    return { payload: myAddresses };
  }
);

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
      if (state.walletHash === action.payload.wallet.walletHash) {
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

export const addressReducer = createReducer([], (builder) => {
  builder.addCase(walletReloadAddresses, (state, action) => {
    const addresses = action.payload;
    return addresses;
  });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state,
  (state) => state.wallet
);

export const selectWalletAddresses = createSelector(
  (state: RootState) => state,
  (state) => state.addresses
);
