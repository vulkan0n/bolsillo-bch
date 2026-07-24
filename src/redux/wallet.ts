/* eslint-disable @typescript-eslint/no-use-before-define */
import { App } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import {
  createAction,
  createAsyncThunk,
  createReducer,
  createSelector,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { selectExchangeRates } from "@/redux/exchangeRates";
import {
  selectCurrencySettings,
  selectIsStablecoinMode,
  setPreference,
} from "@/redux/preferences";
import { selectIsRebuilding } from "@/redux/sync";

import LocalNotificationService from "@/kernel/app/LocalNotificationService";
import LogService from "@/kernel/app/LogService";
import NotificationService from "@/kernel/app/NotificationService";
import CauldronService from "@/kernel/bch/CauldronService";
import CurrencyService from "@/kernel/bch/CurrencyService";
import AddressManagerService, {
  AddressEntity,
} from "@/kernel/wallet/AddressManagerService";
import AddressScannerService from "@/kernel/wallet/AddressScannerService";
import TransactionHistoryService from "@/kernel/wallet/TransactionHistoryService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";
import WalletManagerService, {
  WalletEntity,
} from "@/kernel/wallet/WalletManagerService";

import { convertCashAddress } from "@/util/cashaddr";
import { MIN_SWAP_SATS, PUSD_TOKENID } from "@/util/tokens";

const Log = LogService("redux/wallet");

const PENDING_SWAP_STORAGE_KEY = "pendingSwap";
let isRetryingSwap = false;

const initialState = {
  walletHash: "",
  balance: "0",
  spendable_balance: "0",
  name: "-",
  key_viewed_at: "",
  pendingSwap: null as { sats: string; retryCount: number } | null,
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

    // Save for auto-swap before the shift loop consumes the array
    const bchIncomingSats = utxoIn
      .filter((u) => u.token_category === null)
      .reduce((sum, u) => sum + u.valueSatoshis, 0n);

    while (utxoIn.length > 0) {
      const utxo = utxoIn.shift()!;
      satsDiff += utxo.valueSatoshis;
    }

    while (utxoOut.length > 0) {
      const utxo = utxoOut.shift()!;
      satsDiff -= utxo.valueSatoshis;
    }

    // —— Auto-swap: convert incoming BCH to PUSD when stablecoinMode ON ——
    if (bchIncomingSats > 0n) {
      const state = thunkApi.getState() as RootState;
      if (selectIsStablecoinMode(state) && !selectIsRebuilding(state)) {
        const { localCurrency } = selectCurrencySettings(state);
        const rates = selectExchangeRates(state);
        const Currency = CurrencyService(localCurrency, rates);
        const isAboveThreshold =
          bchIncomingSats >= MIN_SWAP_SATS &&
          parseFloat(Currency.satsToFiat(bchIncomingSats)) >= 200;

        if (isAboveThreshold) {
          const { swapSats } = calcSwapAmount(bchIncomingSats);

          // ------------------------
          // S3: Guard against zero
          // ------------------------
          if (swapSats === 0n) {
            Log.warn("Auto-swap: zero swap amount, skipping");
            return;
          }

          try {
            const Cauldron = CauldronService();
            await Cauldron.fetchPools(PUSD_TOKENID);
            const trade = Cauldron.prepareTrade(
              "BCH",
              PUSD_TOKENID,
              swapSats,
              wallet,
              true
            );
            const txHash = await Cauldron.broadcastTransaction(trade.tx_hex);
            const price = Cauldron.getTokenPrice(PUSD_TOKENID).toString();

            TransactionHistoryService(wallet.walletHash).setTransactionMemo(
              txHash,
              JSON.stringify({
                __swap: true,
                price,
                pusdAmount: trade.tradeResult.summary.demand.toString(),
              })
            );

            thunkApi.dispatch(clearPendingSwap());
            Log.log("Auto-swap succeeded", txHash, price);
          } catch (e) {
            Log.warn("Auto-swap failed, scheduling retry", e);

            const swapPayload = {
              sats: swapSats.toString(),
              retryCount: 0,
            };
            thunkApi.dispatch(setPendingSwap(swapPayload));
            // W2: Persist for crash recovery
            await Preferences.set({
              key: PENDING_SWAP_STORAGE_KEY,
              value: JSON.stringify(swapPayload),
            });
            NotificationService().error(
              "Modo Estable",
              "No se pudo estabilizar. Abrí la app de nuevo para reintentar."
            );

            // Schedule automatic retry after sync stabilizes and
            // Cauldron pool data becomes available (resume-triggered
            // retryPendingSwap fires at t+2s, too early for sync).
            setTimeout(() => {
              thunkApi.dispatch(retryPendingSwap());
            }, 15000);
          }
        }
      }
    }

    // Always fire notification regardless of swap outcome
    NotificationService().paymentReceived(satsDiff);

    // Fire local notification if app is in background, accumulate for resume aggregation
    if (satsDiff > 546n) {
      const lns = LocalNotificationService();
      App.getState().then((state) => {
        if (state.isActive) {
          // Foreground: in-app toast already fires — nothing more to do here
          return;
        }

        // Background: increment pending counter and fire local notification
        lns.incrementPendingTx(satsDiff);
        lns.schedulePaymentReceived(satsDiff);
      });
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

export const setPendingSwap = createAction<{
  sats: string;
  retryCount: number;
} | null>("wallet/setPendingSwap");

export const clearPendingSwap = createAction("wallet/clearPendingSwap");

export const retryPendingSwap = createAsyncThunk(
  "wallet/retryPendingSwap",
  async (_, thunkApi) => {
    // -------------------------------------------------------
    // W3: In-flight guard — no concurrent retries
    // -------------------------------------------------------
    if (isRetryingSwap) return;
    isRetryingSwap = true;

    const state = thunkApi.getState() as RootState;
    const { pendingSwap } = state.wallet;
    if (!pendingSwap) {
      isRetryingSwap = false;
      return;
    }

    // -------------------------------------------------------
    // W1: Flag gate — if stablecoinMode is OFF, clear pending
    // -------------------------------------------------------
    if (!selectIsStablecoinMode(state)) {
      Log.log("retryPendingSwap: stablecoinMode OFF, clearing pending");
      thunkApi.dispatch(clearPendingSwap());
      await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      isRetryingSwap = false;
      return;
    }

    if (pendingSwap.retryCount >= 3) {
      thunkApi.dispatch(clearPendingSwap());
      await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      isRetryingSwap = false;
      return;
    }

    const wallet = WalletManagerService().getWallet(state.wallet.walletHash);
    if (!wallet.walletHash) {
      thunkApi.dispatch(clearPendingSwap());
      await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      isRetryingSwap = false;
      return;
    }

    try {
      const Cauldron = CauldronService();
      await Cauldron.fetchPools(PUSD_TOKENID);
      const swapSats = BigInt(pendingSwap.sats);

      // -------------------------------------------------------
      // S3: Defensive zero guard
      // -------------------------------------------------------
      if (swapSats === 0n) {
        Log.warn("retryPendingSwap: zero swap amount, clearing");
        thunkApi.dispatch(clearPendingSwap());
        await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
        isRetryingSwap = false;
        return;
      }

      const trade = Cauldron.prepareTrade(
        "BCH",
        PUSD_TOKENID,
        swapSats,
        wallet,
        true
      );
      const txHash = await Cauldron.broadcastTransaction(trade.tx_hex);

      TransactionHistoryService(wallet.walletHash).setTransactionMemo(
        txHash,
        JSON.stringify({
          __swap: true,
          price: Cauldron.getTokenPrice(PUSD_TOKENID).toString(),
          pusdAmount: trade.tradeResult.summary.demand.toString(),
        })
      );

      NotificationService().success(
        "Modo Estable",
        "Estabilización completada."
      );
      Log.log("Retry swap succeeded", txHash);

      // W2: Clear persisted pending on success
      await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      isRetryingSwap = false;
    } catch (e) {
      Log.warn("Retry swap failed", e);

      // W2: Persist updated retry count (reducer will bump in-memory +1)
      const newRetryCount = pendingSwap.retryCount + 1;
      if (newRetryCount >= 3) {
        await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      } else {
        await Preferences.set({
          key: PENDING_SWAP_STORAGE_KEY,
          value: JSON.stringify({
            sats: pendingSwap.sats,
            retryCount: newRetryCount,
          }),
        });
      }

      isRetryingSwap = false;
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw e;
    }
  }
);

export const rehydratePendingSwap = createAsyncThunk(
  "wallet/rehydratePendingSwap",
  async (_, thunkApi) => {
    const stored = await Preferences.get({ key: PENDING_SWAP_STORAGE_KEY });
    if (stored.value) {
      try {
        const parsed = JSON.parse(stored.value) as {
          sats: string;
          retryCount: number;
        };
        if (
          parsed &&
          typeof parsed.sats === "string" &&
          typeof parsed.retryCount === "number"
        ) {
          thunkApi.dispatch(
            setPendingSwap({ sats: parsed.sats, retryCount: parsed.retryCount })
          );
        }
      } catch {
        await Preferences.remove({ key: PENDING_SWAP_STORAGE_KEY });
      }
    }
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
    })
    .addCase(setPendingSwap, (state, action) => {
      state.pendingSwap = action.payload;
    })
    .addCase(clearPendingSwap, (state) => {
      state.pendingSwap = null;
    })
    .addCase(retryPendingSwap.fulfilled, (state) => {
      state.pendingSwap = null;
    })
    .addCase(retryPendingSwap.rejected, (state) => {
      if (state.pendingSwap) {
        state.pendingSwap.retryCount += 1;
        if (state.pendingSwap.retryCount >= 3) {
          state.pendingSwap = null;
        }
      }
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

export const selectPendingSwap = createSelector(
  (state: RootState) => state.wallet,
  (wallet) => wallet.pendingSwap
);

// --------------------------------
// Pure helpers (exported for testing)
// --------------------------------

export function calcSwapAmount(bchSatsIn: bigint): {
  swapSats: bigint;
  reserveSats: bigint;
} {
  const swapSats = (bchSatsIn * 99n) / 100n;
  return { swapSats, reserveSats: bchSatsIn - swapSats };
}

export function isAboveMinThreshold(
  bchSatsIn: bigint,
  localCurrency: string,
  rates: Array<{ currency: string; price: string }>
): boolean {
  if (bchSatsIn < MIN_SWAP_SATS) return false;
  const rate = rates.find((r) => r.currency === localCurrency)?.price;
  if (!rate) return false;
  const bchAmount = Number(bchSatsIn) / 100_000_000;
  const fiatValue = bchAmount * Number(rate);
  return fiatValue >= 200;
}
