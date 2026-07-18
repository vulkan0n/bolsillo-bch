/**
 * Tests for buildSweepTransaction token filtering
 *
 * buildSweepTransaction must exclude token-bearing UTXOs and warn the user
 * when tokens are skipped during a sweep (modo-estable token-safety fix).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UtxoEntity } from "@/kernel/wallet/UtxoManagerService";

import { buildSweepTransaction } from "./TransactionBuilderService";

// vi.hoisted ensures warnMock is defined before vi.mock factories run.
const warnMock = vi.hoisted(() => vi.fn());

// Mock LogService so warn calls are trackable.
vi.mock("@/kernel/app/LogService", () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: warnMock,
    error: vi.fn(),
    trace: vi.fn(),
  })),
}));

// Mock cashaddr so buildSweepTransaction doesn't need real address decoding.
vi.mock("@/util/cashaddr", () => ({
  addressToLockingBytecode: vi.fn(() => new Uint8Array(25)),
}));

// Mock @bitauth/libauth — keep original exports for transitive deps but
// override crypto/tx functions used by buildSweepTransaction.
vi.mock("@bitauth/libauth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    walletTemplateP2pkhNonHd: {},
    walletTemplateToCompilerBCH: vi.fn(() => ({})),
    generateTransaction: vi.fn(() => ({
      success: true,
      transaction: { inputs: [], outputs: [] },
    })),
    encodeTransaction: vi.fn(() => new Uint8Array(128)),
    getMinimumFee: vi.fn(() => 1000n),
    swapEndianness: vi.fn((hex: string) => hex),
    hexToBin: vi.fn((hex: string) => new Uint8Array(hex.length / 2)),
    binToHex: vi.fn((bytes: Uint8Array) => "00".repeat(bytes.length)),
  };
});

// Helper to build a minimal UtxoEntity for testing
function makeUtxo(
  txHash: string,
  valueSatoshis: bigint,
  tokenCategory: string | null = null
): UtxoEntity {
  return {
    address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    tx_hash: txHash,
    tx_pos: 0,
    valueSatoshis,
    memo: null,
    token_category: tokenCategory,
    token_amount: tokenCategory ? 100n : null,
    nft_capability: null,
    nft_commitment: null,
  };
}

describe("buildSweepTransaction token filter", () => {
  beforeEach(() => {
    warnMock.mockClear();
  });

  it("excludes token-bearing UTXOs and warns", { timeout: 15000 }, () => {
    const bchUtxo = makeUtxo("aaa", 50000n, null);
    const tokenUtxo = makeUtxo("bbb", 20000n, "some_token_id");

    const result = buildSweepTransaction(
      [bchUtxo, tokenUtxo],
      new Uint8Array(32),
      "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    );

    expect(result).toHaveProperty("tx_hash");
    expect(result).toHaveProperty("hex");
    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining("skipped 1 token UTXO")
    );
  });

  it("includes all UTXOs when none carry tokens", () => {
    const bchUtxo1 = makeUtxo("aaa", 50000n, null);
    const bchUtxo2 = makeUtxo("bbb", 30000n, null);

    const result = buildSweepTransaction(
      [bchUtxo1, bchUtxo2],
      new Uint8Array(32),
      "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    );

    expect(result).toHaveProperty("tx_hash");
    expect(warnMock).not.toHaveBeenCalled();
  });

  it("handles empty UTXO array", () => {
    expect(() =>
      buildSweepTransaction(
        [],
        new Uint8Array(32),
        "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
      )
    ).not.toThrow();
    expect(warnMock).not.toHaveBeenCalled();
  });

  it("excludes NFT-only UTXOs (token_category set, no amount)", () => {
    const bchUtxo = makeUtxo("aaa", 50000n, null);
    const nftUtxo: UtxoEntity = {
      ...makeUtxo("bbb", 10000n, "nft_token_id"),
      token_amount: null,
      nft_capability: "mutable",
    };

    const result = buildSweepTransaction(
      [bchUtxo, nftUtxo],
      new Uint8Array(32),
      "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    );

    expect(result).toHaveProperty("tx_hash");
    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining("skipped 1 token UTXO")
    );
  });

  it("filters all UTXOs when all carry tokens and warns", () => {
    const tokenUtxo1 = makeUtxo("aaa", 50000n, "token_a");
    const tokenUtxo2 = makeUtxo("bbb", 30000n, "token_b");

    const result = buildSweepTransaction(
      [tokenUtxo1, tokenUtxo2],
      new Uint8Array(32),
      "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    );

    expect(result).toHaveProperty("tx_hash");
    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining("skipped 2 token UTXO")
    );
  });
});
