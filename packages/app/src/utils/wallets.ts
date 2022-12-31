import { SeleneWalletType, CoinType } from "@selene-wallet/common/types";

export const getWalletUTXOs = (wallet: SeleneWalletType): CoinType[] =>
  wallet?.addresses
    .filter((a) => a?.coins?.length >= 1)
    .flatMap((a) => a.coins) ?? [];

export const getWalletUTXOcount = (wallet: SeleneWalletType): number =>
  getWalletUTXOs(wallet).length;

export const getWalletSatoshiBalance = (wallet: SeleneWalletType): string =>
  getWalletUTXOs(wallet)
    .reduce((sum, utxo) => sum + utxo.satoshis, 0)
    .toString();
