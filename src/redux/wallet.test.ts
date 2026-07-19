/**
 * Tests for wallet redux: reducer, selectors, and auto-swap logic.
 *
 * Auto-swap converts incoming BCH to PUSD when stablecoinMode is ON.
 * The pure helpers (calcSwapAmount, isAboveMinThreshold) are tested directly.
 * The thunk integration (walletReceive) is tested with mocked dependencies.
 *
 * Flag-OFF invariant: with stablecoinMode off, the auto-swap path is unreachable
 * because selectIsStablecoinMode returns false. Structural analysis:
 *   walletReceive → if (!selectIsStablecoinMode(state)) → skip auto-swap block.
 * No mocked test can prove unreachability, but the gate is at the top of the block.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  calcSwapAmount,
  clearPendingSwap,
  isAboveMinThreshold,
  rehydratePendingSwap,
  selectPendingSwap,
  setPendingSwap,
  walletReceive,
  walletReducer,
} from "./wallet";

// ---------------------------------------------------------------------------
// Mock services for behavioral tests
// ---------------------------------------------------------------------------

const mockCauldron = vi.hoisted(() => ({
  fetchPools: vi.fn(),
  prepareTrade: vi.fn(),
  broadcastTransaction: vi.fn(),
  getTokenPrice: vi.fn(() => 100n),
}));

vi.mock("@/kernel/bch/CauldronService", () => ({
  default: () => mockCauldron,
}));

vi.mock("@/kernel/wallet/UtxoManagerService", () => ({
  default: () => ({
    getUtxo: vi.fn(() => ({
      utxo_id: "test-utxo",
      valueSatoshis: 100000n,
      token_category: null,
    })),
  }),
}));

vi.mock("@/kernel/app/NotificationService", () => ({
  default: () => ({
    paymentReceived: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("@/kernel/app/LocalNotificationService", () => ({
  default: () => ({
    incrementPendingTx: vi.fn(),
    schedulePaymentReceived: vi.fn(),
    captureBalanceSnapshot: vi.fn(),
    checkResumeNotification: vi.fn(),
  }),
}));

vi.mock("@capacitor/app", () => ({
  App: {
    getState: vi.fn(() => Promise.resolve({ isActive: true })),
  },
}));

// ---------------------------------------------------------------------------
// Split calculation: 99/1 with BigInt, rounding, zero
// ---------------------------------------------------------------------------

describe("calcSwapAmount (99/1 split)", () => {
  it("splits 100000 sats into 99000 swap + 1000 reserve", () => {
    const result = calcSwapAmount(100000n);
    expect(result.swapSats).toBe(99000n);
    expect(result.reserveSats).toBe(1000n);
  });

  it("rounds down tiny amounts: 1 sat → 0 swap, 1 reserve", () => {
    const result = calcSwapAmount(1n);
    expect(result.swapSats).toBe(0n);
    expect(result.reserveSats).toBe(1n);
  });

  it("handles zero: 0 → 0 swap, 0 reserve", () => {
    const result = calcSwapAmount(0n);
    expect(result.swapSats).toBe(0n);
    expect(result.reserveSats).toBe(0n);
  });

  it("handles large amounts without overflow", () => {
    const result = calcSwapAmount(BigInt(1_000_000_000));
    expect(result.swapSats).toBe(990_000_000n);
    expect(result.reserveSats).toBe(10_000_000n);
  });

  it("swapSats + reserveSats always equals input", () => {
    const inputs = [1n, 2n, 99n, 100n, 101n, 1000n, 100000n, 999999n];
    inputs.forEach((input) => {
      const { swapSats, reserveSats } = calcSwapAmount(input);
      expect(swapSats + reserveSats).toBe(input);
    });
  });
});

// ---------------------------------------------------------------------------
// Threshold: below/above 200 ARS equivalent with mocked rate
// ---------------------------------------------------------------------------

describe("isAboveMinThreshold", () => {
  const arsRate = { currency: "ARS", price: "500000" }; // 500k ARS per BCH

  it("returns false for amount below MIN_SWAP_SATS (5000)", () => {
    expect(isAboveMinThreshold(4999n, "ARS", [arsRate])).toBe(false);
  });

  it("returns false at MIN_SWAP_SATS (5000 = ~25 ARS @ 500k)", () => {
    // 5000 sats * (1/100M) BCH/sat * 500k ARS/BCH = 25 ARS < 200
    expect(isAboveMinThreshold(5000n, "ARS", [arsRate])).toBe(false);
  });

  it("returns true at 40000 sats (exactly 200 ARS @ 500k)", () => {
    // 40000 * (1/100M) * 500k = 200 ARS → >= 200 → true
    expect(isAboveMinThreshold(40000n, "ARS", [arsRate])).toBe(true);
  });

  it("returns true at 50000 sats (~250 ARS @ 500k)", () => {
    // 50000 * (1/100M) * 500k = 250 ARS >= 200 → true
    expect(isAboveMinThreshold(50000n, "ARS", [arsRate])).toBe(true);
  });

  it("returns true for large incoming amounts", () => {
    expect(isAboveMinThreshold(1_000_000n, "ARS", [arsRate])).toBe(true);
  });

  it("returns false when rate is missing for currency", () => {
    expect(isAboveMinThreshold(50000n, "USD", [arsRate])).toBe(false);
  });

  it("works with USD rate", () => {
    const usdRate = { currency: "USD", price: "80000" }; // 80k USD per BCH
    // 50000 sats = 0.0005 BCH * 80000 = 40 USD >= 200? No, 40 < 200
    expect(isAboveMinThreshold(50000n, "USD", [usdRate])).toBe(false);
    // 250000 sats = 0.0025 BCH * 80000 = 200 USD
    expect(isAboveMinThreshold(250000n, "USD", [usdRate])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Reducer: pendingSwap state management
// ---------------------------------------------------------------------------

describe("walletReducer (pendingSwap)", () => {
  function makeInitial() {
    return {
      walletHash: "",
      balance: "0",
      spendable_balance: "0",
      name: "-",
      key_viewed_at: "",
      pendingSwap: null,
    };
  }

  it("starts with pendingSwap = null", () => {
    const state = walletReducer(undefined, { type: "@@init" });
    expect(state.pendingSwap).toBeNull();
  });

  it("setPendingSwap stores swap data", () => {
    const state = walletReducer(
      makeInitial(),
      setPendingSwap({ sats: "99000", retryCount: 0 })
    );
    expect(state.pendingSwap).toEqual({ sats: "99000", retryCount: 0 });
  });

  it("setPendingSwap can update existing pending data", () => {
    const s1 = walletReducer(
      makeInitial(),
      setPendingSwap({ sats: "99000", retryCount: 0 })
    );
    const s2 = walletReducer(
      s1,
      setPendingSwap({ sats: "50000", retryCount: 1 })
    );
    expect(s2.pendingSwap).toEqual({ sats: "50000", retryCount: 1 });
  });

  it("setPendingSwap with null clears pending state", () => {
    const s1 = walletReducer(
      makeInitial(),
      setPendingSwap({ sats: "99000", retryCount: 0 })
    );
    const s2 = walletReducer(s1, setPendingSwap(null));
    expect(s2.pendingSwap).toBeNull();
  });

  it("clearPendingSwap sets to null", () => {
    const s1 = walletReducer(
      makeInitial(),
      setPendingSwap({ sats: "99000", retryCount: 0 })
    );
    const s2 = walletReducer(s1, clearPendingSwap());
    expect(s2.pendingSwap).toBeNull();
  });

  it("clearPendingSwap on null is a no-op", () => {
    const state = walletReducer(makeInitial(), clearPendingSwap());
    expect(state.pendingSwap).toBeNull();
  });

  it("selectPendingSwap returns pendingSwap from state", () => {
    const state = {
      ...makeInitial(),
      pendingSwap: { sats: "99000", retryCount: 0 },
    };
    // selectPendingSwap takes RootState and drills to wallet
    const rootState = {
      wallet: state,
      preferences: {},
      sync: {},
      exchangeRates: {},
    } as any;
    expect(selectPendingSwap(rootState)).toEqual({
      sats: "99000",
      retryCount: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// Flag-OFF invariant: behavioral verification
// ---------------------------------------------------------------------------

describe("Flag-OFF invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call CauldronService when stablecoinMode is off", async () => {
    // Build a RootState-like shape with stablecoinMode="false"
    const state = {
      wallet: {
        walletHash: "test-hash",
        balance: "0",
        spendable_balance: "0",
        name: "-",
        key_viewed_at: "",
        pendingSwap: null,
      },
      preferences: {
        stablecoinMode: "false",
        localCurrency: "ARS",
        preferLocalCurrency: "true",
        denomination: "bch",
        authMode: "none",
        pinHash: "",
        pinInputMode: "false",
        authActions: "Any",
        activeWalletHash: "test-hash",
        bchNetwork: "mainnet",
        languageCode: "es",
        enableExperimental: "false",
        enablePrerelease: "false",
        lastCheckIn: "",
        lastExchangeRate: "1",
        useTokenAddress: "false",
        allowInstantPay: "false",
        instantPayThreshold: "2000000",
        instantPayThresholdFiat: "10000",
        useLegacyBip21: "true",
        qrCodeLogo: "bch",
        qrCodeBackground: "#ffffff",
        qrCodeForeground: "#23A06D",
        displayExploreTab: "true",
        displayExchangeRate: "true",
        displaySyncCounter: "true",
        shouldConstrainViewport: "true",
        themeMode: "system",
        electrumServer: "",
        offlineMode: "false",
        hideAvailableBalance: "false",
        enableDailyCheckIn: "false",
        encryptionDeviceOnly: "false",
        lastKeyBackupExport: "",
        expertMode: "false",
      },
      sync: {
        isRebuilding: false,
        isConnected: false,
        currentBlockHeight: 0,
        syncPercent: 0,
        lastSyncAt: 0,
        serverUrl: "",
        serverConnected: false,
        initialSyncDone: false,
      },
      exchangeRates: {
        rates: [],
        lastFetch: 0,
      },
    } as any;

    // Dispatch walletReceive with a valid-looking UTXO diff
    const dispatch = vi.fn();
    const done = walletReceive({
      wallet: {
        walletHash: "test-hash",
        name: "test",
        balance: "0",
        spendable_balance: "0",
      } as any,
      utxoDiff: { diffIn: ["utxo1"], diffOut: [] },
    })(dispatch, () => state, undefined);

    // walletReceive calls NotificationService().paymentReceived unconditionally
    // so the thunk completes even with stablecoinMode off
    await expect(done).resolves.not.toThrow();

    // CauldronService must NOT have been called — the flag gate prevents it
    expect(mockCauldron.fetchPools).not.toHaveBeenCalled();
    expect(mockCauldron.prepareTrade).not.toHaveBeenCalled();
  });
});
