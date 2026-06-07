/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createAsyncThunk,
  createReducer,
  createSelector,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { setPreference } from "@/redux/preferences";

import NotificationService from "@/kernel/app/NotificationService";
import AddressManagerService, {
  AddressEntity,
} from "@/kernel/wallet/AddressManagerService";
import AddressScannerService from "@/kernel/wallet/AddressScannerService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";
import WalletManagerService, {
  WalletEntity,
} from "@/kernel/wallet/WalletManagerService";

import { convertCashAddress } from "@/util/cashaddr";

const initialState = {
  walletHash: "",
  balance: "0",
  spendable_balance: "0",
  name: "-",
  key_viewed_at: "",
};

// --------------------------------

// walletBoot: loads wallet by walletHash, populates addresses.
// Does NOT connect to Electrum — redux_resume() handles that.
export const walletBoot = createAsyncThunk(
  "wallet/boot",
  async (payload: { walletHash: string }, thunkApi) => {
    const { walletHash } = payload;

    const wallet = await WalletManagerService().boot(walletHash);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletHash", value: wallet.walletHash })
    );

    const AddressScanner = AddressScannerService(wallet);
    AddressScanner.populateAddresses();

    thunkApi.dispatch(walletReloadAddresses({ wallet }));

    return wallet;
  }
);

export const walletSyncDiff = createAsyncThunk(
  "wallet/syncDiff",
  (
    payload: {
      wallet: WalletEntity;
      utxoDiff: { diffIn: Array<string>; diffOut: Array<string> };
    },
    thunkApi
  ) => {
    const { wallet, utxoDiff } = payload;

    // address and wallet balances are automatically derived on SQL layer when UTXO entries are updated
    const sqlWallet = WalletManagerService().getWallet(wallet.walletHash);

    const previousBalance = BigInt(wallet.balance);
    const currentBalance = BigInt(sqlWallet.balance);
    const currentSpendableBalance = BigInt(sqlWallet.spendable_balance);

    Log.debug("wallet/syncDiff", previousBalance, currentBalance, utxoDiff);

    if (currentBalance > previousBalance) {
      thunkApi.dispatch(walletReceive({ wallet, utxoDiff }));
    }

    return {
      previousBalance: previousBalance.toString(),
      currentBalance: currentBalance.toString(),
      currentSpendableBalance: currentSpendableBalance.toString(),
    };
  }
);

export const walletReceive = createAsyncThunk(
  "wallet/receive",
  async (
    payload: {
      wallet: WalletEntity;
      utxoDiff: { diffIn: Array<string>; diffOut: Array<string> };
    },
    thunkApi
  ) => {
    const { wallet, utxoDiff } = payload;

    const UtxoManager = UtxoManagerService(wallet.walletHash);
    const utxoIn = utxoDiff.diffIn.map((utxo) => UtxoManager.getUtxo(utxo));
    const utxoOut = utxoDiff.diffOut.map((utxo) => UtxoManager.getUtxo(utxo));

    if (utxoIn.length === 0) {
      return;
    }

    let satsDiff = 0n;

    Log.debug("walletReceive", utxoIn);

    while (utxoIn.length > 0) {
      const utxo = utxoIn.shift()!;
      satsDiff += utxo.valueSatoshis;
    }

    while (utxoOut.length > 0) {
      const utxo = utxoOut.shift()!;
      satsDiff -= utxo.valueSatoshis;
    }

    NotificationService().paymentReceived(satsDiff);
  }
);

export const walletSetName = createAction<string>("wallet/name");

export const walletSetKeyViewed = createAction(
  "wallet/key_viewed",
  (payload: { walletHash: string }) => {
    const key_viewed_at = WalletManagerService().updateKeyViewed(
      payload.walletHash
    );

    return { payload: key_viewed_at };
  }
);

export const walletReloadAddresses = createAction(
  "wallet/reloadAddresses",
  (payload: { wallet: WalletEntity }) => {
    const AddressManager = AddressManagerService(payload.wallet.walletHash);

    const myAddresses = [
      ...AddressManager.getReceiveAddresses(),
      ...AddressManager.getChangeAddresses(),
    ].map((a) => ({ change: a.change, address: a.address }));

    myAddresses.push(
      ...myAddresses.map((a) => ({
        change: a.change,
        address: convertCashAddress(a.address, "tokenaddr"),
      }))
    );

    return { payload: myAddresses };
  }
);

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const wallet = action.payload;
      Object.assign(state, wallet);
    })
    .addCase(walletSyncDiff.fulfilled, (state, action) => {
      state.balance = action.payload.currentBalance;
      state.spendable_balance = action.payload.currentSpendableBalance;
    })
    .addCase(walletSetName, (state, action) => {
      state.name = action.payload;
    })
    .addCase(walletSetKeyViewed, (state, action) => {
      state.key_viewed_at = action.payload;
    });
});

const addressInitialState: Array<AddressEntity> = [];
export const addressReducer = createReducer(addressInitialState, (builder) => {
  builder.addCase(walletReloadAddresses, (state, action) => {
    const addresses = action.payload;
    Object.assign(state, addresses);
  });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state,
  (state) => state.wallet
);

export const selectActiveWalletHash = createSelector(
  (state: RootState) => state.wallet,
  (wallet) => wallet.walletHash
);

export const selectWalletAddresses = createSelector(
  (state: RootState) => state,
  (state) => state.addresses
);

export const selectGenesisHeight = createSelector(
  (state: RootState) => state.wallet,
  (wallet) => wallet.genesis_height
);

export const selectActiveWalletBalance = createSelector(
  (state) => state.wallet,
  (wallet) => ({
    balance: BigInt(wallet.balance),
    spendable_balance: BigInt(wallet.spendable_balance),
  })
);

export const selectActiveWalletName = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.name
);

export const selectKeyViewedAt = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.key_viewed_at
);
