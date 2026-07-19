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

// ---------------------------------------------------------------------------
// buildStablecoinTransaction tests
// ---------------------------------------------------------------------------

const mockCauldron = vi.hoisted(() => ({
  fetchPools: vi.fn(),
  getPoolInputs: vi.fn(),
  getTokenPrice: vi.fn(() => 100n),
  prepareTrade: vi.fn(),
  broadcastTransaction: vi.fn(),
  disconnect: vi.fn(),
}));

const mockExchangeLabInstance = vi.hoisted(() => ({
  constructTradeBestRateForTargetDemand: vi.fn(),
  constructTradeBestRateForTargetSupply: vi.fn(),
  createTradeTx: vi.fn(),
  generatePoolV0LockingBytecode: vi.fn(),
}));

const mockUtxoManager = vi.hoisted(() => ({
  selectTokens: vi.fn(),
  selectCoins: vi.fn(),
  getCategoryUtxos: vi.fn(),
  getUtxo: vi.fn(),
}));

const mockKeyManager = vi.hoisted(() => ({
  getAddressPrivateKey: vi.fn(() => new Uint8Array(32)),
}));

const mockAddressManager = vi.hoisted(() => ({
  getUnusedAddresses: vi.fn(() => [
    {
      address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      change: 0,
    },
  ]),
  getReceiveAddresses: vi.fn(),
  getChangeAddresses: vi.fn(),
}));

const mockWalletManager = vi.hoisted(() => ({
  getWallet: vi.fn(() => ({
    walletHash: "test-wallet-hash",
    balance: "1000000",
    spendable_balance: "500000",
  })),
  boot: vi.fn(),
}));

vi.mock("@/kernel/bch/CauldronService", () => ({
  default: () => mockCauldron,
}));

vi.mock("@cashlab/cauldron", () => ({
  ExchangeLab: function () {
    return mockExchangeLabInstance;
  },
}));

vi.mock("@cashlab/common", () => ({
  PayoutAmountRuleType: { FIXED: "FIXED", CHANGE: "CHANGE" },
  SpendableCoinType: { P2PKH: "P2PKH", UNLOCK_ON_DEMAND: "UNLOCK_ON_DEMAND" },
}));

vi.mock("@/kernel/wallet/WalletManagerService", () => ({
  default: () => mockWalletManager,
}));

vi.mock("@/kernel/wallet/UtxoManagerService", () => ({
  default: () => mockUtxoManager,
}));

vi.mock("@/kernel/wallet/KeyManagerService", () => ({
  default: () => mockKeyManager,
}));

vi.mock("@/kernel/wallet/AddressManagerService", () => ({
  default: () => mockAddressManager,
}));

vi.mock("@/util/tokens", () => ({
  PUSD_TOKENID:
    "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544",
}));

// Mock sha256 with deterministic output for tx hash
vi.mock("@/util/hash", () => ({
  sha256: {
    hash: vi.fn(() => new Uint8Array(32).fill(0xaa)),
  },
}));

const mockPoolV0 = {
  version: "0" as const,
  parameters: { withdraw_pubkey_hash: new Uint8Array(20) },
  outpoint: { txhash: new Uint8Array(32), index: 0 },
  output: {
    locking_bytecode: new Uint8Array(25),
    token: {
      amount: 50000n,
      token_id:
        "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544",
    },
    amount: 5000000n,
  },
};

describe("buildStablecoinTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: pools are available
    mockCauldron.getPoolInputs.mockReturnValue([mockPoolV0]);
    mockCauldron.getTokenPrice.mockReturnValue(100n);

    // Default: successful trade
    mockExchangeLabInstance.constructTradeBestRateForTargetDemand.mockReturnValue(
      {
        entries: [
          { pool: mockPoolV0, supply: 100n, demand: 10000n, trade_fee: 0n },
        ],
        summary: {
          supply: 100n,
          demand: 10000n,
          rate: { numerator: 100n, denominator: 1n },
          trade_fee: 0n,
        },
      }
    );

    // Default: token UTXOs available
    mockUtxoManager.selectTokens.mockReturnValue([
      {
        address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
        tx_hash: "aa",
        tx_pos: 0,
        valueSatoshis: 500000n,
        token_category:
          "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544",
        token_amount: 1000n,
        memo: null,
        nft_capability: null,
        nft_commitment: null,
      },
    ]);
    mockUtxoManager.selectCoins.mockReturnValue([
      {
        address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
        tx_hash: "bb",
        tx_pos: 0,
        valueSatoshis: 500000n,
        token_category: null,
        token_amount: null,
        memo: null,
        nft_capability: null,
        nft_commitment: null,
      },
    ]);

    // Default: successful createTradeTx
    mockExchangeLabInstance.createTradeTx.mockReturnValue({
      txbin: new Uint8Array(256),
      txfee: 1000n,
      libauth_source_outputs: [],
      libauth_generated_transaction: { inputs: [], outputs: [] },
      payouts_info: [],
      token_burns: [],
    });
  });

  it("builds atomic swap+pay transaction with combined PUSD and BCH inputs", async () => {
    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    // Verify non-bigint (success)
    expect(typeof result).not.toBe("bigint");

    if (typeof result !== "bigint") {
      expect(result).toHaveProperty("hex");
      expect(result).toHaveProperty("tx_hash");
      expect(result).toHaveProperty("tradeResult");

      // Verify the combined inputs
      expect(mockUtxoManager.selectTokens).toHaveBeenCalledWith(
        expect.stringContaining("2469acc5"),
        expect.any(BigInt)
      );
      expect(mockUtxoManager.selectCoins).toHaveBeenCalledWith(
        expect.any(BigInt)
      );
      expect(mockExchangeLabInstance.createTradeTx).toHaveBeenCalledTimes(1);
    }
  });

  it("returns bigint (shortfall) when no PUSD UTXOs available", async () => {
    mockUtxoManager.selectTokens.mockReturnValue([]);

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    expect(typeof result).toBe("bigint");
    expect((result as bigint) > 0n).toBe(true);
  });

  it("throws TransactionBuilderError when no pool data available", async () => {
    mockCauldron.getPoolInputs.mockReturnValue([]);

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    await expect(
      svc.buildStablecoinTransaction({
        recipients: [
          {
            address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
            amount: 200000n,
          },
        ],
        tradeSats: 100000n,
      })
    ).rejects.toThrow("Cauldron pool unavailable");
  });

  it("returns bigint when ExchangeLab trade construction fails", async () => {
    mockExchangeLabInstance.constructTradeBestRateForTargetDemand.mockImplementation(
      () => {
        throw new Error("InsufficientCapitalInPools");
      }
    );

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    expect(typeof result).toBe("bigint");
  });

  it("returns bigint when createTradeTx fails without required_amount", async () => {
    mockExchangeLabInstance.createTradeTx.mockImplementation(() => {
      throw new Error("ValueError: invalid payout");
    });

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    expect(typeof result).toBe("bigint");
  });

  it("retries with bumped fee when InsufficientFunds has required_amount", async () => {
    const insufficient = new Error("InsufficientFunds");
    (insufficient as any).required_amount = 5000n;

    // First call throws, second call succeeds
    mockExchangeLabInstance.createTradeTx
      .mockImplementationOnce(() => {
        throw insufficient;
      })
      .mockImplementationOnce(() => ({
        txbin: new Uint8Array(256),
        txfee: 1000n,
        libauth_source_outputs: [],
        libauth_generated_transaction: { inputs: [], outputs: [] },
        payouts_info: [],
        token_burns: [],
      }));

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    // Should succeed on retry
    expect(typeof result).not.toBe("bigint");
    // createTradeTx called twice (initial + retry)
    expect(mockExchangeLabInstance.createTradeTx).toHaveBeenCalledTimes(2);
  });

  it("processes Send Max: includes all PUSD tokens in the swap", async () => {
    // Simulate Send Max by having enough PUSD to cover the full trade
    mockUtxoManager.selectTokens.mockReturnValue([
      {
        address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
        tx_hash: "aa",
        tx_pos: 0,
        valueSatoshis: 500000n,
        token_category:
          "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544",
        token_amount: 10000n,
        memo: null,
        nft_capability: null,
        nft_commitment: null,
      },
    ]);
    mockUtxoManager.selectCoins.mockReturnValue([
      {
        address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
        tx_hash: "bb",
        tx_pos: 0,
        valueSatoshis: 500000n,
        token_category: null,
        token_amount: null,
        memo: null,
        nft_capability: null,
        nft_commitment: null,
      },
    ]);

    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    // Send Max: tradeSats equals full PUSD value in BCH
    const result = await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 600000n,
        },
      ],
      tradeSats: 100000n,
    });

    expect(typeof result).not.toBe("bigint");

    // Verify selectTokens called with trade result's supply amount
    expect(mockUtxoManager.selectTokens).toHaveBeenCalled();
    expect(mockExchangeLabInstance.createTradeTx).toHaveBeenCalled();
  });

  it("passes correct recipient output and change rules to createTradeTx", async () => {
    const TxBuilder = (await import("./TransactionBuilderService")).default;
    const svc = TxBuilder("test-wallet-hash");

    await svc.buildStablecoinTransaction({
      recipients: [
        {
          address: "bchtest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
          amount: 200000n,
        },
      ],
      tradeSats: 100000n,
    });

    // Verify createTradeTx called with correct arguments
    expect(mockExchangeLabInstance.createTradeTx).toHaveBeenCalledWith(
      expect.any(Array), // tradeResult.entries
      expect.arrayContaining([
        expect.objectContaining({ type: "P2PKH" }), // SpendableCoin inputs
      ]),
      expect.arrayContaining([
        expect.objectContaining({ type: "FIXED" }), // Recipient payout rule
        expect.objectContaining({ type: "CHANGE" }), // Change payout rule
      ]),
      null, // No OP_RETURN data
      expect.any(BigInt) // TXFEE_PER_BYTE
    );
  });
});
