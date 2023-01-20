import { ElectrumClient } from "electrum-cash-react-native";
import { SeleneAddressType } from "@selene-wallet/common/dist/types";
import store from "@selene-wallet/app/src/redux/store";
import { mergeSeleneAddressToWallet } from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";

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

export const loadElectrumCash = async () => {
  await electrum.connect();
  const testSubscribeAddress =
    "bitcoincash:qpm9jd7ac95wph3papmgdkt4tat2wd5a5u76hmff6x";
  console.log("setting up subscription");
  const res = findWalletNameAndHdIndexOfKnownCashAddress(testSubscribeAddress);
  console.log({ res });

  const notify = await electrum.subscribe(
    async (event) => {
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
    },
    "blockchain.address.subscribe",
    testSubscribeAddress
  );
  console.log({ notify });
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
