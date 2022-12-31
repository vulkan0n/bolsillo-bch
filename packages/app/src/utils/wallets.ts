import { SeleneWalletType } from "@selene-wallet/common/types";

export const getWalletUTXOs = (wallet: SeleneWalletType) =>
  wallet?.addresses
    .filter((a) => a?.coins?.length >= 1)
    .flatMap((a) => a.coins) ?? [];

export const getWalletUTXOcount = (wallet: SeleneWalletType) =>
  getWalletUTXOs(wallet).length;

export const getWalletSatoshiBalance = (wallet: SeleneWalletType) =>
  getWalletUTXOs(wallet).reduce((sum, utxo) => sum + utxo.satoshis, 0);
