// @vitest-environment jsdom
/**
 * Tests for useStableBalance hook.
 *
 * Folding: PUSD token balance + BCH reserve → unified local-currency amount.
 * PUSD valued at 1 USD, converted to local currency via exchange rates.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { PUSD_TOKENID } from "@/util/tokens";

// ---------------------------------------------------------------------------
// Mutable test state
// ---------------------------------------------------------------------------

let mockSpendableBalance = "0";
let mockLocalCurrency = "ARS";
let mockRates: Array<{ currency: string; price: string }> = [
  { currency: "USD", price: "45000" },
  { currency: "ARS", price: "12345678" },
];
let mockPusdUtxos: Array<{ token_amount: bigint }> = [];

const mockCurrencySvc = vi.hoisted(() => ({
  satsToFiat: vi.fn((sats: bigint) => {
    const satsNum = Number(sats);
    return (satsNum * 0.12345678).toFixed(2);
  }),
  getSymbol: vi.fn(() => "$"),
}));

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/kernel/bch/CurrencyService", () => ({
  default: vi.fn(() => mockCurrencySvc),
}));

let utxoManagerThrow = false;

vi.mock("@/kernel/wallet/UtxoManagerService", () => ({
  default: vi.fn(() => {
    if (utxoManagerThrow) {
      throw new Error("db unavailable");
    }
    return {
      getCategoryUtxos: vi.fn((category: string) => {
        if (category === PUSD_TOKENID) return mockPusdUtxos;
        return [];
      }),
    };
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn((selector: (s: unknown) => unknown) => {
    const state = {
      wallet: {
        balance: mockSpendableBalance,
        spendable_balance: mockSpendableBalance,
      },
      preferences: { localCurrency: mockLocalCurrency },
      exchangeRates: { rates: mockRates },
    };
    return selector(state);
  }),
}));

// ---------------------------------------------------------------------------

import { useStableBalance } from "./useStableBalance";

describe("useStableBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpendableBalance = "0";
    mockLocalCurrency = "ARS";
    mockRates = [
      { currency: "USD", price: "45000" },
      { currency: "ARS", price: "12345678" },
    ];
    mockPusdUtxos = [];
    utxoManagerThrow = false;
  });

  it("returns zero amounts when no PUSD and no BCH", () => {
    const { result } = renderHook(() => useStableBalance("test-wallet"));

    expect(result.current.pusdAmount).toBe("0.00");
    expect(result.current.fiatCurrency).toBe("ARS");
    expect(result.current.fiatSymbol).toBe("$");
  });

  it("returns correct PUSD amount string (2 decimals)", () => {
    mockPusdUtxos = [{ token_amount: 5000n }];

    const { result } = renderHook(() => useStableBalance("test-wallet"));

    expect(result.current.pusdAmount).toBe("50.00");
  });

  it("returns correct PUSD amount for non-round values", () => {
    mockPusdUtxos = [{ token_amount: 1234n }];

    const { result } = renderHook(() => useStableBalance("test-wallet"));

    expect(result.current.pusdAmount).toBe("12.34");
  });

  it("folds PUSD + BCH into unified fiat total", () => {
    mockPusdUtxos = [{ token_amount: 5000n }];
    mockSpendableBalance = "1000000";

    const { result } = renderHook(() => useStableBalance("test-wallet"));

    expect(result.current.pusdAmount).toBe("50.00");
    expect(result.current.totalFiatFormatted).toBeTruthy();
    expect(
      result.current.totalFiatFormatted.replace(/[^0-9,.]/g, "").length
    ).toBeGreaterThan(0);
  });

  it("handles missing exchange rates without crashing", () => {
    mockRates = [];
    mockPusdUtxos = [{ token_amount: 100n }];

    const { result } = renderHook(() => useStableBalance("test-wallet"));

    // Falls back to "1" for both rates
    expect(result.current.pusdAmount).toBe("1.00");
  });

  it("handles UtxoManager error gracefully", () => {
    utxoManagerThrow = true;

    const { result } = renderHook(() => useStableBalance("test-wallet"));

    expect(result.current.pusdAmount).toBe("0.00");
  });
});
