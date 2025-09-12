import LogService from "@/services/LogService";
import CauldronDexService, {
  PoolTrackerEntry,
  PoolV0,
} from "@/services/CauldronDexService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import TransactionManagerService from "@/services/TransactionManagerService";
import ElectrumClientManager from "@/util/electrum_client_manager";
import { Exception } from "@cashlab/common";
import { uint8ArrayEqual } from "@cashlab/libauth";

const Log = LogService("StablecoinService");

export interface TokenRecipient {
  address: string;
  token: { category: string; amount: bigint };
}

export interface StablecoinOffer {
  tradeResult: {
    summary: {
      supply: bigint;
      demand: bigint;
      trade_fee: bigint;
    };
    entries: Array<{ pool: PoolV0 }>;
  };
  tradeTransaction: {
    txbin: Uint8Array;
    txfee: bigint;
  };
}

export interface StablecoinResult {
  txhash: string;
  tx: any; // Replace with TransactionEntity from TransactionManagerService if typed
}

export class StablecoinError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default function StablecoinService(walletHash: string) {
  const TransactionBuilder = TransactionBuilderService(walletHash);
  const TransactionManager = TransactionManagerService();
  const CauldronDex = CauldronDexService();
  let electrumClientManager: ElectrumClientManager | null = null;
  let dexClient: any | null = null; // Replace with CauldronDexClient type if available
  let tracker: PoolTrackerEntry | null = null;

  return {
    sendTokensWithFees,
    cleanup,
    cancel,
  };

  // sendTokensWithFees: orchestrates sending tokens with fees paid via Cauldron contracts
  async function sendTokensWithFees(
    feePayingTokenCategory: string,
    tokenRecipient: TokenRecipient,
    onOffer: (offer: StablecoinOffer) => void,
    onQuoteChange: (offer: StablecoinOffer) => void,
    abortSignal?: AbortSignal
  ): Promise<StablecoinResult> {
    Log.debug("Starting sendTokensWithFees", {
      feePayingTokenCategory,
      tokenRecipient,
    });

    if (tokenRecipient.token.category !== feePayingTokenCategory) {
      throw new StablecoinError(
        "Token category does not match fee-paying category"
      );
    }

    electrumClientManager = CauldronDex.createCauldronRostrumClientManager();
    dexClient = CauldronDex.createClient(electrumClientManager);
    await dexClient.init();

    let currentOffer: StablecoinOffer | null = null;
    let hasQuoteChanged = false;

    try {
      tracker = await dexClient.addTokenTracker(feePayingTokenCategory);

      // Handle initial pools and offer creation
      const onInitPools = async (event: MessageEvent) => {
        if (event.data.category !== feePayingTokenCategory) return;
        try {
          const inputPools = event.data.pools as PoolV0[];
          currentOffer = createOffer(inputPools);
          onOffer(currentOffer);
        } catch (err) {
          throw new StablecoinError(`Failed to create offer: ${err.message}`);
        }
      };

      // Handle pool updates (quote changes)
      const onUpdate = (event: MessageEvent) => {
        if (
          event.data.category !== feePayingTokenCategory ||
          !currentOffer ||
          !tracker?.data
        )
          return;
        const { tradeResult } = currentOffer;
        const usedPoolsMissing = tradeResult.entries.some(
          (entry) =>
            !tracker!.data.some(
              (pool: PoolV0) =>
                uint8ArrayEqual(
                  pool.outpoint.txhash,
                  entry.pool.outpoint.txhash
                ) && pool.outpoint.index === entry.pool.outpoint.index
            )
        );
        if (usedPoolsMissing) {
          hasQuoteChanged = true;
          try {
            const inputPools = tracker!.data as PoolV0[];
            currentOffer = createOffer(inputPools);
            onQuoteChange(currentOffer);
          } catch (err) {
            Log.warn("Failed to update offer on pool change", err);
          }
        }
      };

      // Handle connection errors
      const onConnectError = (event: MessageEvent) => {
        throw new StablecoinError(`Connection error: ${event.data}`);
      };

      // Handle console events (logging)
      const onConsoleEvent = (event: MessageEvent) => {
        const { type, message, error, data } = event.data;
        switch (type) {
          case "warn":
            Log.warn(message, { error, data });
            break;
          case "error":
            Log.error(message, { error, data });
            break;
          case "info":
            Log.info(message, { data });
            break;
          default:
            Log.log(message, { data });
        }
      };

      // Set up event listeners
      electrumClientManager.addEventListener("connect-error", onConnectError);
      electrumClientManager.addEventListener("console", onConsoleEvent);
      dexClient.addEventListener("console", onConsoleEvent);
      dexClient.addEventListener("init-pools", onInitPools);
      dexClient.addEventListener("update", onUpdate);

      // Handle cancellation
      if (abortSignal) {
        abortSignal.addEventListener("abort", async () => {
          await cancel();
          throw new StablecoinError("Operation cancelled");
        });
      }

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        electrumClientManager!.addEventListener("connected", () => {
          electrumClientManager!.removeEventListener(
            "connect-error",
            onConnectError
          );
          resolve();
        });
        electrumClientManager!.init().catch(reject);
      });

      // Confirm and broadcast transaction
      if (!currentOffer) {
        throw new StablecoinError("No offer created before confirmation");
      }

      const { tradeTransaction } = currentOffer;
      const { txhash } = await dexClient.broadcastTransaction(
        tradeTransaction.txbin
      );

      // Wait for propagation (mimics original 5-second delay)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const tx = await TransactionManager.resolveTransaction(txhash);
      return { txhash, tx };
    } catch (err) {
      if (
        err instanceof Exception &&
        err.message.includes("InsufficientFunds")
      ) {
        throw new Exception("InsufficientFunds", err);
      }
      throw new StablecoinError(err.message || String(err));
    } finally {
      if (!abortSignal?.aborted) {
        await cleanup();
      }
    }

    function createOffer(inputPools: PoolV0[]): StablecoinOffer {
      return TransactionBuilder.buildSendTokensTransactionWithFeePayingTokenCategory(
        {
          recipients: [tokenRecipient],
          exchangeLab: dexClient!.getExchangeLab(),
          inputPools,
          feePayingTokenCategory,
        }
      );
    }
  }

  // cleanup: destroys the client and manager
  async function cleanup() {
    try {
      if (dexClient) {
        await dexClient.destroy();
        dexClient = null;
      }
      if (electrumClientManager) {
        await electrumClientManager.destroy();
        electrumClientManager = null;
      }
      tracker = null;
      Log.debug("Cleaned up StablecoinService resources");
    } catch (err) {
      Log.warn("Cleanup failed", err);
    }
  }

  // cancel: cancels ongoing operations and cleans up
  async function cancel() {
    if (tracker && tracker.activeSub && dexClient) {
      try {
        const client = dexClient.getElectrumClientManager().getClient();
        if (client) {
          await client.unsubscribe(
            "cauldron.contract.subscribe",
            2,
            tracker.category
          );
        }
      } catch (err) {
        Log.warn("Failed to unsubscribe during cancel", err);
      }
    }
    await cleanup();
  }
}
