import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";
import DatabaseService from "@/services/DatabaseService";
import LogService from "@/services/LogService";

const Log = LogService("TokenManagerService");

export interface TokenEntity {}

export default function TokenManagerService(walletHash: string) {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const walletDb = Database.getWalletDatabase(walletHash);

  return {
    getToken,
    getTokenUtxos,
    getTokenCategories,
    calculateTokenAmounts,
    getTokenHistory,
    registerTokenHistory,
    resolveTokenIdentity,
    resolveTokenData,
  };

  function getTokenUtxos() {
    const UtxoManager = UtxoManagerService(walletHash);
    const tokenUtxos = UtxoManager.getWalletTokens();
    return tokenUtxos;
  }

  function getTokenCategories() {
    const tokenUtxos = getTokenUtxos();
    const tokenCategories = tokenUtxos.reduce(
      (categories, utxo) =>
        !categories.includes(utxo.token_category)
          ? [...categories, utxo.token_category]
          : categories,
      []
    );

    return tokenCategories;
  }

  function calculateTokenAmounts(category: string) {
    const tokenUtxos = getTokenUtxos();
    const amount = tokenUtxos
      .filter((utxo) => utxo.token_category === category)
      .reduce((total, utxo) => total + utxo.token_amount, 0);

    const nftCount = tokenUtxos.filter(
      (utxo) => utxo.token_category === category && utxo.nft_capability !== null
    ).length;

    return { amount, nftCount };
  }

  function getTokenHistory(category: string) {
    const result = walletDb.exec(
      "SELECT * FROM token_transactions WHERE category=?;",
      [category]
    );

    Log.debug("getTokenHistory", category, result);
    return result;
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
    const amounts = calculateTokenAmounts(category);

    const splitSymbol = identity.token.symbol.split("-");
    const tokenData = {
      category,
      color: colorHex,
      ...amounts,
      ...identity,
      token: { ...identity.token, symbol: splitSymbol[0] },
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
        txid, category, amount, nft_amount
      ) VALUES ($txid, $category, $amount, $nft_amount);`,
          {
            $txid: tx_hash,
            $category: token.category,
            $amount: token.amount,
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

      APP_DB.exec(
        "UPDATE bcmr_tokens SET symbol=$symbol WHERE category=$category",
        {
          $category: category,
          $symbol: tokenIdentity.token.symbol,
        }
      );
    } catch (e) {
      tokenIdentity = generateTokenIdentity(category);
    }

    //Log.debug("resolveTokenIdentity", tokenIdentity);

    return tokenIdentity;
  }
}
