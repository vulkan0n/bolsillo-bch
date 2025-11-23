/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import {
  setPreference,
  selectElectrumServer,
  selectIsStablecoinMode,
} from "@/redux/preferences";
import { syncConnect, selectIsRebuilding } from "@/redux/sync";

import { ValidBchNetwork } from "@/util/electrum_servers";

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import ElectrumService from "@/services/ElectrumService";
import CauldronService from "@/services/CauldronService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import TokenManagerService from "@/services/TokenManagerService";

import ToastService from "@/services/ToastService";
import LogService from "@/services/LogService";

import { convertCashAddress } from "@/util/cashaddr";
import { MUSD_TOKENID } from "@/util/tokens";

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

    const AddressScanner = AddressScannerService(wallet);
    AddressScanner.populateAddresses();

    thunkApi.dispatch(walletReloadAddresses({ wallet }));

    const isMainnet = network === "mainnet";

    const server = isMainnet
      ? selectElectrumServer(thunkApi.getState())
      : ElectrumService(network).selectFallbackServer("");

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
    let tokenSats = 0n;
    const tokenDiff = {};

    Log.debug("walletReceive", utxoIn);

    // iterate over all incoming UTXOs
    while (utxoIn.length > 0) {
      const utxo = utxoIn.shift()!;

      satsDiff += utxo.amount;

      const category = utxo.token_category;

      // check for tokens, otherwise continue to next UTXO
      if (!category) {
        continue; // eslint-disable-line no-continue
      }

      if (!tokenDiff[category]) {
        tokenDiff[category] = 0n;
      }

      tokenDiff[category] += utxo.token_amount;
      tokenSats += utxo.amount;

      // check for matching utxoOut entry
      const outIndex = utxoOut.findIndex((u) => u.token_category === category);
      if (outIndex > -1) {
        const output = utxoOut.splice(outIndex, 1)[0];
        tokenDiff[category] -= output?.token_amount || 0n;
      }
    }

    // iterate over all spent UTXOs
    while (utxoOut.length > 0) {
      const utxo = utxoOut.shift()!;
      satsDiff -= utxo.amount;
    }

    // receiving tokens
    if (Object.keys(tokenDiff).length > 0) {
      Log.debug("tokenDiff", tokenDiff);
      const TokenManager = TokenManagerService(
        wallet.walletHash,
        wallet.network
      );

      // spawn a receive popup for each token category
      Object.keys(tokenDiff).forEach((category) => {
        const tokenData = TokenManager.getToken(category);
        const token = {
          ...tokenData,
          amount: tokenDiff[category],
        };

        ToastService().tokenReceived(token);
      });
    }

    // need to swap to stablecoin in stablecoin mode
    const isStablecoinMode = selectIsStablecoinMode(thunkApi.getState());
    const isRebuilding = selectIsRebuilding(thunkApi.getState());

    if (isStablecoinMode && !isRebuilding) {
      const incomingSats = satsDiff - tokenSats;

      Log.debug("incomingSats", incomingSats);

      const Cauldron = CauldronService();
      try {
        // make sure pool UTXOs are loaded!
        await Cauldron.fetchPools(MUSD_TOKENID);
      } catch (e) {
        Log.warn(e);
        Log.error("swap on receive failed!");
        ToastService().paymentReceived(incomingSats);
      }

      for (let i = 0; i < 3; i += 1) {
        try {
          /* eslint-disable no-await-in-loop */
          const tradeTransaction = await Cauldron.prepareTrade(
            "BCH",
            MUSD_TOKENID,
            incomingSats,
            wallet,
            true
          );
          Log.debug("tradeTransaction", tradeTransaction);
          await Cauldron.broadcastTransaction(tradeTransaction.tx_hex);
          const tokenData = TokenManagerService(
            wallet.walletHash,
            wallet.network
          ).getToken(MUSD_TOKENID);
          ToastService().tokenReceived({
            ...tokenData,
            amount: tradeTransaction.tradeResult.summary.demand,
          });
          return;
        } catch (e) {
          Log.warn(e);
        }
      }

      Log.error("swap on receive failed!");
      ToastService().paymentReceived(incomingSats);
    } else {
      ToastService().paymentReceived(satsDiff);
    }
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
