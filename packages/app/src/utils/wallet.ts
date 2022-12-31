import {
  SeleneWalletType,
  CoinType,
  SeleneAddressType,
} from "@selene-wallet/common/dist/types";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import emit from "@selene-wallet/app/src/utils/emit";

export const getWalletUTXOs = (wallet: SeleneWalletType): CoinType[] =>
  wallet?.addresses
    ?.filter((a) => a?.coins?.length >= 1)
    ?.flatMap((a) => a.coins) ?? [];

export const getWalletUTXOsToSendAmount = (
  wallet: SeleneWalletType,
  satoshisToSend: number
): CoinType[] => {
  const utxos: CoinType[] = getWalletUTXOs(wallet);
  const totalSatsRequired: number = satoshisToSend + 2000; // Buffer for fees
  console.log({ utxos });
  let total = 0;
  const sufficientUTXOs: CoinType[] = [];
  for (let i = 0; i < utxos.length; i++) {
    if (total < totalSatsRequired) {
      sufficientUTXOs.push(utxos[i]);
      total += sufficientUTXOs[i].satoshis;
      console.log({ i, total, sufficientUTXOs });
    }
    break;
  }
  return sufficientUTXOs;
};

export const getWalletUTXOcount = (wallet: SeleneWalletType): number =>
  getWalletUTXOs(wallet)?.length;

export const getWalletSatoshiBalance = (wallet: SeleneWalletType): string =>
  getWalletUTXOs(wallet)
    .reduce((sum, utxo) => sum + utxo.satoshis, 0)
    .toString();

export const getWalletLastAddress = (
  wallet: SeleneWalletType
): SeleneAddressType => {
  const walletAddressLength = wallet?.addresses?.length;
  return wallet?.addresses?.[walletAddressLength - 1];
};

const getWalletLastAddressHdIndex = (wallet: SeleneWalletType): number =>
  getWalletLastAddress(wallet)?.hdWalletIndex;

export const scanAddressAtIndex = (
  wallet: SeleneWalletType,
  hdWalletIndex: number,
  isTestNet: boolean
) => {
  emit({
    type: BRIDGE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX,
    data: {
      name: wallet?.name,
      mnemonic: wallet?.mnemonic,
      derivationPath: wallet?.derivationPath,
      hdWalletIndex,
      isTestNet,
    },
  });
};

export const getWalletDepositAddress = (
  wallet: SeleneWalletType,
  isTestNet: boolean = false
): string => {
  // Next deposit address is first address
  // without any transaction history or unspent UTXOs
  // It should be impossible to have unspent UTXOs without history
  // but recently sent coins may show a UTXO history and transaction history has
  // not refreshed yet so checking both to be safe
  const depositAddressIndex = wallet?.addresses?.findIndex(
    (a) => a?.transactions?.length === 0 && a?.coins?.length === 0
  );
  const freshDepositAddress =
    wallet?.addresses?.[depositAddressIndex]?.cashaddr;

  if (freshDepositAddress) {
    return freshDepositAddress;
  }

  // Generate 3 new fresh addresses
  const lastAddressHdIndex = getWalletLastAddressHdIndex(wallet);
  scanAddressAtIndex(wallet, lastAddressHdIndex + 1, isTestNet);
  scanAddressAtIndex(wallet, lastAddressHdIndex + 2, isTestNet);
  scanAddressAtIndex(wallet, lastAddressHdIndex + 3, isTestNet);

  // In case app is offline, default back to the most recent available address
  return getWalletLastAddress(wallet)?.cashaddr || "";
};

export const scanDepositAddress = (
  wallet: SeleneWalletType,
  isTestNet: boolean = false
): void => {
  const depositAddressIndex = wallet?.addresses?.findIndex(
    (a) => a?.transactions?.length === 0 && a?.coins?.length === 0
  );
  const freshDepositAddressHdIndex =
    wallet?.addresses?.[depositAddressIndex]?.hdWalletIndex;

  scanAddressAtIndex(wallet, freshDepositAddressHdIndex, isTestNet);
};

// Scan 10 new addresses, starting at index 0
// and skipping over any addresses that are already known
// Note that new UTXOs (coins) on addresses at known indices
// will not be detected (use checkWalletExistingAddresses() instead)
export const scanWallet10NewAddresses = (
  wallet: SeleneWalletType,
  isTestNet: boolean
) => {
  let counter = 0;
  let index = 0;

  while (counter < 10) {
    const isAddressAtIndex =
      wallet?.addresses?.find((a) => a?.hdWalletIndex === index) || false;

    if (!isAddressAtIndex) {
      scanAddressAtIndex(wallet, index, isTestNet);
      counter += 1;
    }

    index += 1;
  }
};

// Re-check all known addresses on a wallet
// Most likely use: looking for new coins on existing addresses
export const checkWalletExistingAddresses = (
  wallet: SeleneWalletType,
  isTestNet: boolean
) => {
  const lastAddressHdIndex = getWalletLastAddressHdIndex(wallet);

  for (let i = 0; i <= lastAddressHdIndex; i++) {
    scanAddressAtIndex(wallet, i, isTestNet);
  }
};
