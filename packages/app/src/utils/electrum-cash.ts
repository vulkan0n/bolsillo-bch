import { ElectrumClient } from "electrum-cash-react-native";

export const electrum = new ElectrumClient(
  "Electrum client example",
  "1.4.1",
  "bch.imaginary.cash"
);

export const loadElectrumCash = async () => {
  await electrum.connect();
};

// Not sure why typescript is messed up here, but it's correct
export const getAddressTransactionHistory = async (
  cashaddr: string
): Promise<[{ height: number; tx_hash: string }?]> =>
  await electrum.request("blockchain.address.get_history", cashaddr);

export const extractTransactionHistory = async (f: {
  hdWalletIndex: number;
  cashaddr: string;
}): Promise<{
  hdWalletIndex: number;
  cashaddr: string;
  transactions: [{ height: number; tx_hash: string }?];
}> => {
  return {
    ...f,
    transactions: await getAddressTransactionHistory(f.cashaddr),
  };
};

export const getTransactionDetails = async (tx_hash: string) =>
  await electrum.request("blockchain.transaction.get", tx_hash, true);

export const getCashAddressUTXOs = async (cashaddr: string): Promise<[any?]> =>
  await electrum.request("blockchain.address.listunspent", cashaddr);
