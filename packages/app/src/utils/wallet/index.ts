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
  console.log("selecting from these UTXOs", utxos);
  const totalSatsRequired: number = satoshisToSend + 10000; // Buffer for fees
  let total = 0;
  const sufficientUTXOs: CoinType[] = [];

  for (let i = 0; i < utxos.length; i++) {
    if (total < totalSatsRequired) {
      sufficientUTXOs.push(utxos[i]);
      total += sufficientUTXOs[i].satoshis;
    } else {
      break;
    }
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
  getWalletLastAddress(wallet)?.hdWalletIndex || 0;

export const scanAddressAtIndex = (
  wallet: SeleneWalletType,
  hdWalletIndex: number,
  isTestNet: boolean = false
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

  // Will be 0 if no known addresses
  const nextWalletHdIndex = getWalletLastAddressHdIndex(wallet) + 1;
  const freshDepositAddressHdIndex =
    wallet?.addresses?.[depositAddressIndex]?.hdWalletIndex ||
    nextWalletHdIndex;

  scanAddressAtIndex(wallet, freshDepositAddressHdIndex, isTestNet);
};

export const getWalletAddressHdIndex = (
  wallet: SeleneWalletType,
  address: string
): number => {
  const specificAddress = wallet?.addresses?.find(
    (a) => a?.cashaddr === address
  );
  if (!specificAddress) {
    throw Error(
      `Cannot find address: ${address}" in wallet.name: ${wallet.name}`
    );
  }

  return specificAddress?.hdWalletIndex;
};

// Scan 10 new addresses, starting at index 0
// and skipping over any addresses that are already known
// Note that new UTXOs (coins) on addresses at known indices
// will not be detected (use checkWalletExistingAddresses() instead)
export const scanWalletXNewAddresses = (
  wallet: SeleneWalletType,
  numberToScan: number,
  isTestNet: boolean
) => {
  let counter = 0;
  let index = 0;

  while (counter < numberToScan) {
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

// Re-check latest 10 addresses, both used and unused
// Most likely use: looking for new coins on existing addresses
export const checkWalletRecentAddresses = (
  wallet: SeleneWalletType,
  isTestNet: boolean
) => {
  const lastAddressHdIndex = getWalletLastAddressHdIndex(wallet);
  const startingPoint = lastAddressHdIndex - 10;

  for (let i = startingPoint; i <= lastAddressHdIndex; i++) {
    scanAddressAtIndex(wallet, i, isTestNet);
  }
};

// Re-check addresses in a given range
export const checkWalletAddressRange = (
  wallet: SeleneWalletType,
  minAddressIndex: number,
  maxAddressIndex: number,
  isTestNet: boolean
) => {
  for (let i = minAddressIndex; i <= maxAddressIndex; i++) {
    console.log("scanning at i: ", i);
    scanAddressAtIndex(wallet, i, isTestNet);
  }
};

export const getSatoshiBalanceFromWalletAddress = (
  address: SeleneAddressType
): number => address?.coins?.reduce((sum, coin) => sum + coin.satoshis, 0) ?? 0;
