import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";
import DatabaseService from "@/services/DatabaseService";
import LogService from "@/services/LogService";

const Log = LogService("TokenManagerService");

export default function TokenManagerService(walletHash: string) {
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(walletHash);

  return {
    getTokenUtxos,
    getTokenCategories,
    getTokenAmounts,
    getTokenHistory,
    getTokenData,
    registerTokenHistory,
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

  function getTokenAmounts(category: string) {
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

  function getTokenData(category: string) {
    const Bcmr = BcmrService();

    const categorySlice = category.slice(0, 6);

    const name = `Token ${categorySlice}`;
    const colorHex = `#${categorySlice}`;

    let identity = {};

    try {
      identity = Bcmr.extractIdentity(category);
    } catch (e) {
      identity = {
        token: {
          symbol: categorySlice,
          decimals: 0,
          category,
        },
        description: "",
      };
    }

    const tokenData = {
      category,
      name,
      color: colorHex,
      ...getTokenAmounts(category),
      ...identity,
    };

    return tokenData;
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
}
