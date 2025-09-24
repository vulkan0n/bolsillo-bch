/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { setPreference, selectElectrumServer } from "@/redux/preferences";
import { syncConnect, syncClearAddresses } from "@/redux/sync";

import { ValidBchNetwork } from "@/util/electrum_servers";

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import ElectrumService from "@/services/ElectrumService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import TokenManagerService from "@/services/TokenManagerService";

import ToastService from "@/services/ToastService";
import LogService from "@/services/LogService";

import { convertCashAddress } from "@/util/cashaddr";

const Log = LogService("redux/wallet");

const initialState = {
  walletHash: "",
  balance: "0",
  spendable_balance: "0",
  name: "-",
  key_viewed_at: "",
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

    thunkApi.dispatch(syncClearAddresses());
    thunkApi.dispatch(walletReloadAddresses({ wallet }));

    const isMainnet = network === "mainnet";

    const server = isMainnet
      ? selectElectrumServer(thunkApi.getState())
      : ElectrumService().selectFallbackServer("");

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
  (payload: {
    wallet: WalletEntity;
    utxoDiff: { diffIn: Array<string>; diffOut: Array<string> };
  }) => {
    const { wallet, utxoDiff } = payload;

    // address and wallet balances are automatically derived on SQL layer when UTXO entries are updated
    const sqlWallet = WalletManagerService().getWallet(wallet.walletHash);

    const previousBalance = BigInt(wallet.balance);
    const currentBalance = BigInt(sqlWallet.balance);
    const currentSpendableBalance = BigInt(sqlWallet.spendable_balance);

    if (currentBalance > previousBalance) {
      const difference = currentBalance - previousBalance;

      const UtxoManager = UtxoManagerService(wallet.walletHash);
      const utxoIn = utxoDiff.diffIn.map((utxo) => UtxoManager.getUtxo(utxo));
      const utxoOut = utxoDiff.diffOut.map((utxo) => UtxoManager.getUtxo(utxo));

      const tokenDiff = {};
      while (utxoIn.length > 0) {
        const utxo = utxoIn.shift();
        const category = utxo!.token_category;

        if (!category) {
          continue; // eslint-disable-line no-continue
        }

        if (!tokenDiff[category]) {
          tokenDiff[category] = 0n;
        }

        tokenDiff[category] += utxo!.token_amount;

        const outIndex = utxoOut.findIndex(
          (u) => u.token_category === category
        );
        const output = utxoOut.splice(outIndex, 1)[0];

        tokenDiff[category] -= output?.token_amount || 0n;
      }

      Log.debug("tokenDiff", tokenDiff);

      if (Object.keys(tokenDiff).length > 0) {
        const TokenManager = TokenManagerService(wallet.walletHash);
        Object.keys(tokenDiff).forEach((category) => {
          const tokenData = TokenManager.getToken(category);
          const token = {
            category,
            decimals: tokenData.token.decimals,
            amount: tokenDiff[category],
          };

          ToastService().paymentReceived(difference, token);
        });
      } else {
        ToastService().paymentReceived(difference);
      }
    }

    return {
      payload: {
        currentBalance: currentBalance.toString(),
        currentSpendableBalance: currentSpendableBalance.toString(),
      },
    };
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
    const AddressScanner = AddressScannerService(payload.wallet);

    AddressScanner.populateAddresses();

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
      return wallet;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
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
    return addresses;
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
  (wallet) => wallet.spendable_balance
);

export const selectActiveWalletName = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.name
);

export const selectKeyViewedAt = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.key_viewed_at
);
