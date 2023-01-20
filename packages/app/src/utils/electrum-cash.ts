import { ElectrumClient } from "electrum-cash-react-native";
import { SeleneAddressType } from "@selene-wallet/common/dist/types";
import store from "@selene-wallet/app/src/redux/store";
import { mergeSeleneAddressToWallet } from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";
import { clearSubscribedCashAddresses } from "../redux/reducers/localReducer";

export const electrum = new ElectrumClient(
  "Electrum client example",
  "1.4.1",
  "bch.imaginary.cash"
);

const findWalletNameAndHdIndexOfKnownCashAddress = (
  cashaddr: string
): { cashaddr: string; name: string; hdWalletIndex: number } => {
  const wallets = store.getState().walletManager.wallets;
  const includedWallet = wallets.find((wallet) =>
    wallet?.addresses?.map((a) => a.cashaddr).includes(cashaddr)
  );
  const hdWalletIndex = includedWallet?.addresses?.find(
    (a) => a?.cashaddr === cashaddr
  )?.hdWalletIndex;

  return {
    cashaddr,
    name: includedWallet?.name,
    hdWalletIndex,
  };
};

export const subscribeToCashAddress = (cashaddr: string) => {
  console.log(`Setting up subscription to ${cashaddr}`);

  const newTransactionCallback = async (
    // Not sure what the second returned value is
    // Looks like a transaction hash, but it isn't
    // The docs say it is "state"
    // It's not really relevant here
    event: [cashAddr: string, someIdentifier: string]
  ) => {
    const cashaddr = event?.[0];
    const { name, hdWalletIndex } =
      findWalletNameAndHdIndexOfKnownCashAddress(cashaddr);
    const seleneAddress = await updateSeleneAddressUTXOsFromAddressFragment({
      cashaddr,
      hdWalletIndex: hdWalletIndex.toString(),
    });
    store.dispatch(
      mergeSeleneAddressToWallet({
        name,
        seleneAddress,
      })
    );
  };

  electrum.subscribe(
    newTransactionCallback,
    "blockchain.address.subscribe",
    cashaddr
  );
};

export const loadElectrumCash = async () => {
  // Clean up any records of previous subscriptions
  store.dispatch(clearSubscribedCashAddresses());
  await electrum.connect();
  const testSubscribeAddress =
    "bitcoincash:qpm9jd7ac95wph3papmgdkt4tat2wd5a5u76hmff6x";
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

export const updateSeleneAddressUTXOsFromAddressFragment =
  async (chosenAddress: {
    cashaddr: string;
    hdWalletIndex: string;
  }): Promise<SeleneAddressType> => {
    console.log({ chosenAddress });
    const unspentUTXOsRawData = await getCashAddressUTXOs(
      chosenAddress?.cashaddr
    );

    const unspentUTXOs = unspentUTXOsRawData.map((coin) => ({
      height: coin.height,
      transactionId: coin.tx_hash,
      outputIndex: coin.tx_pos,
      satoshis: coin.value,
      address: chosenAddress.cashaddr,
      addressIndex: chosenAddress.hdWalletIndex,
    }));

    const seleneAddress = {
      hdWalletIndex: parseInt(chosenAddress?.hdWalletIndex),
      cashaddr: chosenAddress.cashaddr,
      coins: unspentUTXOs,
      // await getTransactionDetails(hash)
      // TODO: Import the transaction history from above
      // const addressWithTransactions = await extractTransactionHistory(
      //   message?.data?.addressFragments[1]
      // );
      // const hash = addressWithTransactions.transactions[0].tx_hash;
      // console.log({ addressWithTransactions, hash });
      // const transactionDetails = await getTransactionDetails(hash);
      // console.log(transactionDetails);
      transactions: [],
    };

    return seleneAddress;
  };
