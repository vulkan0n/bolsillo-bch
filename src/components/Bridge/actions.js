import { emit } from "react-native-react-bridge/lib/web";
import { RESPONSE_MESSAGE_TYPES } from "@utils/bridgeMessages";

export const sendCoins = async (WalletObject, message) => {
  const walletSendCoins = await WalletObject.fromSeed(
    message?.data?.mnemonic,
    message?.data?.derivationPath
  );

  try {
    await walletSendCoins.send([
      {
        cashaddr: message?.data?.recipientCashAddr,
        value: parseInt(message?.data?.satsToSend),
        unit: "sat",
      },
      // {
      //   feePaidBy: "changeThenAny",
      // },
    ]);

    // Note: Monitoring .send() response for send confirmation
    // is unreliable and buggy
    // Instead, successful sends are detected by balance changes
  } catch (sendError) {
    console.log("!!!!!!!!");
    console.log({ sendError });

    emit({
      type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_FAIL,
      data: {
        text: sendError ?? "",
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
