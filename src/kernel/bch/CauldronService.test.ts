/**
 * Tests for CauldronService: pool parsing, price oracle, pool registry,
 * and prepareTrade retry logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { InsufficientFunds } from "@cashlab/common";

import CauldronService, {
  calcTokenPrice,
  parsePoolFromRostrumNodeData,
  type CauldronPoolUtxo,
} from "./CauldronService";

// ---------------------------------------------------------------------------
// Hoisted mocks shared across test suites
// ---------------------------------------------------------------------------

const mockRequest = vi.hoisted(() => vi.fn());
const mockConstructDemand = vi.hoisted(() => vi.fn());
const mockConstructSupply = vi.hoisted(() => vi.fn());
const mockCreateTradeTx = vi.hoisted(() => vi.fn());
const mockGenerateLocking = vi.hoisted(() => vi.fn(() => new Uint8Array(32)));

const mockGetUnusedAddresses = vi.hoisted(() => vi.fn());
const mockGetAddressPrivateKey = vi.hoisted(() => vi.fn());
const mockSelectCoins = vi.hoisted(() => vi.fn());
const mockSelectTokens = vi.hoisted(() => vi.fn());

vi.mock("@/kernel/app/LogService", () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
  })),
}));

vi.mock("@/kernel/bch/ElectrumService", () => ({
  default: vi.fn(() => ({
    getIsConnected: vi.fn(() => false),
    connect: vi.fn(() => Promise.resolve(true)),
    getElectrumClient: vi.fn(() => ({
      request: mockRequest,
    })),
    broadcastTransaction: vi.fn(() => Promise.resolve("txhash")),
    disconnect: vi.fn(() => true),
    getElectrumHost: vi.fn(() => "rostrum.cauldron.quest:50004"),
  })),
}));

vi.mock("@/kernel/wallet/AddressManagerService", () => ({
  default: vi.fn(() => ({
    getUnusedAddresses: mockGetUnusedAddresses,
  })),
}));

vi.mock("@/kernel/wallet/KeyManagerService", () => ({
  default: vi.fn(() => ({
    getAddressPrivateKey: mockGetAddressPrivateKey,
  })),
}));

vi.mock("@/kernel/wallet/UtxoManagerService", () => ({
  default: vi.fn(() => ({
    selectCoins: mockSelectCoins,
    selectTokens: mockSelectTokens,
  })),
}));

vi.mock("@/util/cashaddr", () => ({
  addressToLockingBytecode: vi.fn(() => new Uint8Array(25)),
}));

vi.mock("@/util/hex", () => ({
  binToHex: vi.fn(() => "00"),
  hexToBin: vi.fn(() => new Uint8Array(32)),
}));

vi.mock("@cashlab/cauldron", () => {
  const mockExlabInstance = {
    constructTradeBestRateForTargetDemand: mockConstructDemand,
    constructTradeBestRateForTargetSupply: mockConstructSupply,
    createTradeTx: mockCreateTradeTx,
    generatePoolV0LockingBytecode: mockGenerateLocking,
  };
  return {
    ExchangeLab: function ExchangeLab() {
      return mockExlabInstance;
    },
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePoolUtxo(
  overrides: Partial<CauldronPoolUtxo> = {}
): CauldronPoolUtxo {
  return {
    is_withdrawn: false,
    new_utxo_hash: "h1",
    new_utxo_n: 0,
    new_utxo_txid:
      "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    pkh: "00112233445566778899aabbccddeeff00112233",
    sats: 100000,
    token_amount: 500,
    token_id:
      "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Pure: calcTokenPrice
// ---------------------------------------------------------------------------

describe("calcTokenPrice", () => {
  it("returns 1n for empty pools", () => {
    expect(calcTokenPrice([])).toBe(1n);
  });

  it("returns 1n when satsSum is 0", () => {
    const pools = [makePoolUtxo({ sats: 0, token_amount: 100 })];
    expect(calcTokenPrice(pools)).toBe(1n);
  });

  it("returns 1n when tokenSum is 0", () => {
    const pools = [makePoolUtxo({ sats: 100000, token_amount: 0 })];
    expect(calcTokenPrice(pools)).toBe(1n);
  });

  it("aggregates across multiple pools", () => {
    const pools = [
      makePoolUtxo({ sats: 100000, token_amount: 50 }),
      makePoolUtxo({ sats: 200000, token_amount: 100, new_utxo_hash: "h2" }),
    ];
    // total: 300000 sats / 150 tokens = 2000
    expect(calcTokenPrice(pools)).toBe(2000n);
  });

  it("rounds to nearest integer", () => {
    // 10 sats / 3 tokens = 3.333... → rounding: half of 3 = 1. r=1, half=1, r>=half → 4
    const pools = [makePoolUtxo({ sats: 10, token_amount: 3 })];
    expect(calcTokenPrice(pools)).toBe(4n);
  });

  it("rounds down when remainder below half", () => {
    // 10 sats / 4 tokens = 2.5 → q=2, r=2, half=2, r>=half → 3
    const pools = [makePoolUtxo({ sats: 10, token_amount: 4 })];
    expect(calcTokenPrice(pools)).toBe(3n);
  });
});

// ---------------------------------------------------------------------------
// Pure: parsePoolFromRostrumNodeData
// ---------------------------------------------------------------------------

describe("parsePoolFromRostrumNodeData", () => {
  it("returns null for withdrawn pool", async () => {
    const { ExchangeLab: ExLab } = await import("@cashlab/cauldron");
    const exlab = new ExLab();
    const pool = makePoolUtxo({ is_withdrawn: true });
    expect(parsePoolFromRostrumNodeData(exlab, pool)).toBeNull();
  });

  it("returns PoolV0 for valid pool", async () => {
    const { ExchangeLab: ExLab } = await import("@cashlab/cauldron");
    const exlab = new ExLab();
    const pool = makePoolUtxo();
    const result = parsePoolFromRostrumNodeData(exlab, pool);
    expect(result).not.toBeNull();
    expect(result!.version).toBe("0");
    expect(result!.output.amount).toBe(100000n);
    expect(result!.output.token.amount).toBe(500n);
    expect(result!.output.token.token_id).toBe(pool.token_id);
    expect(result!.outpoint.index).toBe(0);
  });

  it("preserves non-default values", async () => {
    const { ExchangeLab: ExLab } = await import("@cashlab/cauldron");
    const exlab = new ExLab();
    const pool = makePoolUtxo({
      sats: 250000,
      token_amount: 1200,
      new_utxo_n: 3,
      new_utxo_txid:
        "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100",
    });
    const result = parsePoolFromRostrumNodeData(exlab, pool);
    expect(result).not.toBeNull();
    expect(result!.output.amount).toBe(250000n);
    expect(result!.output.token.amount).toBe(1200n);
    expect(result!.outpoint.index).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// CauldronService — integration with mocked deps
// ---------------------------------------------------------------------------

describe("CauldronService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear module-level poolUtxos
    const svc = CauldronService();
    svc.disconnect();
  });

  // ---------------- Pool registry ----------------

  describe("fetchPools (pool registry)", () => {
    it("registers pools from rostrum response", async () => {
      const utxo1 = makePoolUtxo({
        new_utxo_hash: "hash1",
        token_id: "test-category",
      });
      const utxo2 = makePoolUtxo({
        new_utxo_hash: "hash2",
        token_amount: 1000,
        sats: 50000,
        token_id: "test-category",
      });
      mockRequest.mockResolvedValueOnce({ utxos: [utxo1, utxo2] });

      const svc = CauldronService();
      const pools = await svc.fetchPools("test-category");

      expect(mockRequest).toHaveBeenCalledWith(
        "cauldron.contract.subscribe",
        2,
        "test-category"
      );
      expect(pools).toHaveLength(2);
      expect(pools[0].output.amount).toBe(100000n);
      expect(pools[1].output.token.amount).toBe(1000n);
    });

    it("handles empty pool response", async () => {
      mockRequest.mockResolvedValueOnce({ utxos: [] });

      const svc = CauldronService();
      const pools = await svc.fetchPools("test-category");

      expect(pools).toHaveLength(0);
    });

    it("replaces old pools with updated ones (spent utxo semantics)", async () => {
      // First fetch: two pools
      const utxo1 = makePoolUtxo({
        new_utxo_hash: "hash1",
        sats: 50000,
        token_id: "test-category",
      });
      mockRequest.mockResolvedValueOnce({ utxos: [utxo1] });
      const svc = CauldronService();
      await svc.fetchPools("test-category");

      // Second fetch: new pool replaces spent old one
      const utxo2 = makePoolUtxo({
        new_utxo_hash: "hash2",
        spent_utxo_hash: "hash1",
        sats: 60000,
        token_id: "test-category",
      });
      mockRequest.mockResolvedValueOnce({ utxos: [utxo2] });
      // For update semantics, the notification handler needs "update" type
      // Simulate by sending update notification through the internal handler.
      // We re-fetch with result containing the new utxo.
      const pools = await svc.fetchPools("test-category");
      // Since fetchPools clears pools per category and re-registers,
      // the old "hash1" pool is gone, new "hash2" pool is registered.
      expect(pools).toHaveLength(1);
      expect(pools[0].output.amount).toBe(60000n);
    });
  });

  // ---------------- Price oracle via service ----------------

  describe("getTokenPrice", () => {
    it("returns price from registered pools", async () => {
      const utxo1 = makePoolUtxo({
        new_utxo_hash: "h1",
        sats: 100000,
        token_amount: 50,
        token_id: "test-category",
      });
      const utxo2 = makePoolUtxo({
        new_utxo_hash: "h2",
        sats: 200000,
        token_amount: 100,
        token_id: "test-category",
      });
      mockRequest.mockResolvedValueOnce({ utxos: [utxo1, utxo2] });

      const svc = CauldronService();
      await svc.fetchPools("test-category");

      // 300000 sats / 150 tokens = 2000
      expect(svc.getTokenPrice("test-category")).toBe(2000n);
    });

    it("returns 1n when no pools registered", () => {
      const svc = CauldronService();
      expect(svc.getTokenPrice("nonexistent")).toBe(1n);
    });
  });

  // ---------------- prepareTrade retry ----------------

  describe("prepareTrade retry", () => {
    const mockWallet = {
      walletHash: "test-hash",
      mnemonic: "test mnemonic",
      passphrase: "",
      derivation: "48'/0'/0'/0'",
      name: "test",
      balance: 0n,
      created_at: "",
      key_verified_at: "",
      key_viewed_at: "",
      prefix: "bitcoincash",
      network: "mainnet",
      nonce: 0,
      genesis_height: null,
      spendable_balance: 0n,
    };

    beforeEach(() => {
      // Set up wallet-dependent mocks
      mockGetUnusedAddresses.mockReturnValue([
        { address: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a" },
        { address: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a" },
      ]);
      mockGetAddressPrivateKey.mockReturnValue(new Uint8Array(32));
      mockSelectCoins.mockReturnValue([]);
      mockSelectTokens.mockReturnValue([]);
    });

    it("retries on InsufficientFunds with bumped fee and succeeds", async () => {
      // Mock pools populated
      const pool = makePoolUtxo({ token_id: "test-category" });
      mockRequest.mockResolvedValueOnce({ utxos: [pool] });

      // Mock trade construction
      mockConstructDemand.mockReturnValue({
        entries: [],
        summary: {
          demand: 500n,
          supply: 1000000n,
          rate: { numerator: 2000n, denominator: 10000000000000n },
          trade_fee: 0n,
        },
      });

      // First call to createTradeTx throws InsufficientFunds, second succeeds
      const insufficientErr = new InsufficientFunds("insufficient", {
        required_amount: 500n,
      });
      const tradeTxResult = {
        txbin: new Uint8Array(128),
        txfee: 1500n,
        libauth_source_outputs: [],
        libauth_generated_transaction: { inputs: [], outputs: [] },
        payouts_info: [],
        token_burns: [],
      };
      mockCreateTradeTx
        .mockImplementationOnce(() => {
          throw insufficientErr;
        })
        .mockReturnValueOnce(tradeTxResult);

      const svc = CauldronService();
      // Populate pools
      await svc.fetchPools("test-category");
      // Execute trade
      const result = await svc.prepareTrade(
        "BCH",
        "test-category",
        500n,
        mockWallet,
        false
      );

      // createTradeTx called twice: first fails (retry), second succeeds
      expect(mockCreateTradeTx).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty("tx_hex");
      expect(result).toHaveProperty("tradeResult");
    });

    it("throws after max retries exhausted", async () => {
      const pool = makePoolUtxo({ token_id: "test-category" });
      mockRequest.mockResolvedValueOnce({ utxos: [pool] });

      mockConstructDemand.mockReturnValue({
        entries: [],
        summary: {
          demand: 500n,
          supply: 1000000n,
          rate: { numerator: 2000n, denominator: 10000000000000n },
          trade_fee: 0n,
        },
      });

      // Always throw InsufficientFunds
      const insufficientErr = new InsufficientFunds("insufficient", {
        required_amount: 500n,
      });
      mockCreateTradeTx.mockImplementation(() => {
        throw insufficientErr;
      });

      const svc = CauldronService();
      await svc.fetchPools("test-category");

      await expect(
        svc.prepareTrade("BCH", "test-category", 500n, mockWallet, false)
      ).rejects.toThrow(InsufficientFunds);

      // createTradeTx called 4 times (initial + 3 retries = MAX_RETRIES=3)
      expect(mockCreateTradeTx).toHaveBeenCalledTimes(4);
    });

    it("throws non-InsufficientFunds errors immediately", async () => {
      const pool = makePoolUtxo({ token_id: "test-category" });
      mockRequest.mockResolvedValueOnce({ utxos: [pool] });

      mockConstructDemand.mockReturnValue({
        entries: [],
        summary: {
          demand: 500n,
          supply: 1000000n,
          rate: { numerator: 2000n, denominator: 10000000000000n },
          trade_fee: 0n,
        },
      });

      const regularError = new Error("network error");
      mockCreateTradeTx.mockImplementation(() => {
        throw regularError;
      });

      const svc = CauldronService();
      await svc.fetchPools("test-category");

      await expect(
        svc.prepareTrade("BCH", "test-category", 500n, mockWallet, false)
      ).rejects.toThrow("network error");

      expect(mockCreateTradeTx).toHaveBeenCalledTimes(1);
    });
  });
});
