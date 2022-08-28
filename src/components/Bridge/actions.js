import { emit } from "react-native-react-bridge/lib/web";
import { RESPONSE_MESSAGE_TYPES } from "@utils/bridgeMessages";

export const sendCoins = async (WalletObject, message) => {
  const walletSendCoins = await WalletObject.fromSeed(
    message?.data?.mnemonic,
    message?.data?.derivationPath
  );

  console.log("SENDING!!!");
  console.log(message?.data);

  emit({
    type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_LOADING,
    data: {},
  });

  try {
    const txResponse = await walletSendCoins.send([
      {
        cashaddr: message?.data?.recipientCashAddr,
        value: parseInt(message?.data?.satsToSend),
        unit: "sat",
      },
      // {
      //   feePaidBy: "changeThenAny",
      // },
    ]);

    console.log("sent coins!");
    console.log({ txResponse });

    emit({
      type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_SUCCESS,
      data: {
        name: message?.data?.name,
        balance: txResponse?.balance?.sat,
        lastSentTransactionHash: txResponse?.txId,
      },
    });
  } catch (sendError) {
    console.log("!!!!!!!!");
    console.log({ sendError });

    emit({
      type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_FAIL,
      data: {
        text: sendError,
      },
    });
  }
};

export const getWalletHistory = async (WalletObject, message) => {
  const historyWallet = await WalletObject.fromSeed(
    message?.data?.mnemonic,
    message?.data?.derivationPath
  );

  const transactionHistory = await historyWallet.getHistory();
  emit({
    type: RESPONSE_MESSAGE_TYPES.GET_WALLET_HISTORY_RESPONSE,
    data: {
      name: message?.data?.name,
      transactionHistory,
    },
  });
};
