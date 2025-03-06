import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";

export default function TokenManagerService(walletHash) {
  return {
    getTokenUtxos,
    getTokenCategories,
    getTokenAmounts,
    getTokenHistory,
    getTokenData,
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

  function getTokenAmounts(category) {
    const tokenUtxos = getTokenUtxos();
    const amount = tokenUtxos
      .filter((utxo) => utxo.token_category === category)
      .reduce((total, utxo) => total + utxo.token_amount, 0);

    const nftCount = tokenUtxos.filter(
      (utxo) => utxo.token_category === category && utxo.nft_capability !== null
    ).length;

    return { amount, nftCount };
  }

  function getTokenHistory(category) {
    return [];
  }

  function getTokenData(category) {
    const Bcmr = BcmrService();

    const categorySlice = category.slice(0, 6);

    const name = `Token ${categorySlice}`;
    const colorHex = `#${categorySlice}`;

    let identity = {};
    try {
      identity = Bcmr.getIdentity(category);
    } catch (e) {
      // pass
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
}
