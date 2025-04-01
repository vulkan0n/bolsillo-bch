import { IdentitySnapshot, TokenCategory } from "@bitauth/libauth";
import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";
import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService, {
  TransactionEntity,
} from "@/services/TransactionManagerService";
import LogService from "@/services/LogService";

const Log = LogService("TokenManagerService");

export interface TokenEntity extends IdentitySnapshot {
  category: string;
  symbol: string;
  name: string;
  color: string;
  amount: number;
  nftCount: number;
  token: TokenCategory;
  fungible_amount?: bigint;
  nft_amount?: number;
}

export default function TokenManagerService(walletHash: string) {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const walletDb = Database.getWalletDatabase(walletHash);

  return {
    getToken,
    getTokenUtxos,
    getTokenCategories,
    calculateTokenAmounts,
    resolveTokenHistory,
    registerTokenHistory,
    resolveTokenIdentity,
    resolveTokenData,
  };

  function getTokenCategories() {
    const UtxoManager = UtxoManagerService(walletHash);
    const tokenUtxos = UtxoManager.getWalletTokens();

    const tokenCategories = tokenUtxos.reduce(
      (categories, utxo) =>
        !categories.includes(utxo.token_category)
          ? [...categories, utxo.token_category]
          : categories,
      []
    );

    return tokenCategories;
  }

  function getTokenUtxos(category: string) {
    const UtxoManager = UtxoManagerService(walletHash);
    const tokenUtxos = UtxoManager.getCategoryUtxos(category);
    return tokenUtxos;
  }

  function calculateTokenAmounts(category: string) {
    const UtxoManager = UtxoManagerService(walletHash);
    const tokenUtxos = UtxoManager.getWalletTokens();
    const amount = tokenUtxos
      .filter((utxo) => utxo.token_category === category)
      .reduce((total, utxo) => total + utxo.token_amount, 0n);

    const nftCount = tokenUtxos.filter(
      (utxo) => utxo.token_category === category && utxo.nft_capability !== null
    ).length;

    return { amount, nftCount };
  }

  async function resolveTokenHistory(category: string) {
    const tokenTransactions = walletDb.exec(
      "SELECT * FROM token_transactions WHERE category=?;",
      [category]
    );

    const token_txids = tokenTransactions.map((ttx) => ttx.txid);

    const TransactionManager = TransactionManagerService();
    const resolvedTransactions: Array<TransactionEntity> = await Promise.all(
      token_txids.map((txid) => TransactionManager.resolveTransaction(txid))
    );

    const history = token_txids
      .map((txid, i) => ({
        ...tokenTransactions[i],
        ...resolvedTransactions[i],
      }))
      .sort((a, b) => {
        if (a.time > b.time) {
          return -1;
        }

        if (b.time <= a.time) {
          return 1;
        }

        return 0;
      });

    //Log.debug("resolveTokenHistory", category, history);
    return history;
  }

  function generateTokenIdentity(category: string) {
    const Bcmr = BcmrService();
    const categorySlice = category.slice(0, 6);

    const identityRegistry = {
      $schema: "https://cashtokens.org/bcmr-v2.schema.json",
      version: { major: 0, minor: 0, patch: 1 },
      identities: {
        [category]: {
          "1970-01-01T00:00:00.000Z": {
            name: `Token ${categorySlice}`,
            token: {
              symbol: categorySlice,
              category,
              decimals: 0,
            },
          },
        },
      },
      latestRevision: "1970-01-01T00:00:00.000Z",
      registryIdentity: {
        name: "Selene Wallet Generated Null Metadata",
      },
    };

    const identity = Bcmr.extractIdentity(category, identityRegistry);
    //Log.debug("generateTokenIdentity", identity);
    return identity;
  }

  function getToken(category: string): TokenEntity {
    const Bcmr = BcmrService();

    let identity;

    try {
      // try to extract identity from local master BCMR
      identity = Bcmr.extractIdentity(category);
    } catch (e) {
      // generate a placeholder identity if we don't have metadata
      // use resolveTokenData elsewhere to try to download metadata
      identity = generateTokenIdentity(category);
    }

    if (!identity.token) {
      throw new Error(`no token data for ${category}`);
    }

    const colorHex = `#${category.slice(0, 6)}`;

    const splitSymbol = identity.token.symbol.split("-");
    const tokenData = {
      category,
      color: colorHex,
      ...identity,
      token: { ...identity.token, symbol: splitSymbol[0] },
      symbol: splitSymbol[0],
    };

    //Log.debug("getToken", tokenData);
    return tokenData;
  }

  async function resolveTokenData(category: string) {
    //Log.debug("resolveTokenData");
    await resolveTokenIdentity(category);
    return getToken(category);
  }

  function registerTokenHistory(
    tx_hash: string,
    tokens: Array<{ category: string; amount: number; nftAmount: number }>
  ) {
    try {
      tokens.forEach((token) => {
        walletDb.exec(
          `INSERT OR IGNORE INTO token_transactions (
        txid, category, fungible_amount, nft_amount
      ) VALUES ($txid, $category, $fungible_amount, $nft_amount);`,
          {
            $txid: tx_hash,
            $category: token.category,
            $fungible_amount: token.amount,
            $nft_amount: token.nftAmount,
          }
        );
      });
    } catch (e) {
      Log.error(e);
    }

    if (tokens.length > 0) {
      Log.debug("registerTokenHistory", tx_hash, tokens);
    }
  }

  async function resolveTokenIdentity(category: string) {
    const Bcmr = BcmrService();
    const authbase = Bcmr.getCategoryAuthbase(category);
    let tokenIdentity = {};
    try {
      const identityRegistry = await Bcmr.resolveIdentityRegistry(authbase);

      //Log.debug("resolveIdentity using registry", category, registry);

      tokenIdentity = Bcmr.extractIdentity(category, identityRegistry.registry);

      if (!tokenIdentity.token) {
        throw new Error(
          `Unable to resolve token tokenIdentity for ${category}`
        );
      }

      const { symbol, decimals } = tokenIdentity.token;

      try {
        APP_DB.exec(
          `INSERT INTO bcmr_tokens (authbase, category, symbol, decimals)
          VALUES ($authbase, $category, $symbol, $decimals) 
          ON CONFLICT DO UPDATE SET
            authbase=$authbase,
            symbol=$symbol,
            decimals=$decimals
          WHERE category=$category
          ;`,
          {
            $category: category,
            $authbase: authbase,
            $symbol: symbol || "",
            $decimals: decimals || 0,
          }
        );
      } catch (e) {
        Log.error(e);
        throw e;
      }
    } catch (e) {
      tokenIdentity = generateTokenIdentity(category);
    }

    //Log.debug("resolveTokenIdentity", tokenIdentity);

    return tokenIdentity;
  }
}
