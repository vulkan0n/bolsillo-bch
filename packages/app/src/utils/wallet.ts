import { SeleneWalletType, CoinType } from "@selene-wallet/common/dist/types";

export const getWalletUTXOs = (wallet: SeleneWalletType): CoinType[] =>
  wallet?.addresses
    ?.filter((a) => a?.coins?.length >= 1)
    ?.flatMap((a) => a.coins) ?? [];

export const getWalletUTXOcount = (wallet: SeleneWalletType): number =>
  getWalletUTXOs(wallet)?.length;

export const getWalletSatoshiBalance = (wallet: SeleneWalletType): string =>
  getWalletUTXOs(wallet)
    .reduce((sum, utxo) => sum + utxo.satoshis, 0)
    .toString();

export const getWalletDepositAddress = (wallet: SeleneWalletType): string => {
  // Next deposit address is first address
  // without any transaction history or unspent UTXOs
  // It should be impossible to have unspent UTXOs without history
  // but recently sent coins may show a UTXO history and transaction history has
  // not refreshed yet so checking both to be safe
  const depositAddressIndex = wallet?.addresses?.findIndex(
    (a) => a?.transactions?.length === 0 && a?.coins?.length === 0
  );
  return wallet?.addresses?.[depositAddressIndex]?.cashaddr || "";
};
