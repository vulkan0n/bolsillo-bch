import React from "react";
import {
  webViewRender,
  emit,
  useNativeMessage,
} from "react-native-react-bridge/lib/web";
import {
  BRIDGE_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
} from "../../utils/bridgeMessages";

const Bridge = () => {
  console.log("Bridge loaded.");
  // useNativeMessage hook receives message from React Native

  // wallet.named(x) is unavailable
  // Safari (has to be used for iOS debugging)
  // Unfortunately, Safari is also non standard,
  // and it does not allow access to IndexedDB in an iframe/WebView
  // Thus wallet needs to be retrieve from seed phrase every time
  useNativeMessage(async (message) => {
    console.log("Bridge received message: ", message);

    try {
      const WalletObject = message?.data?.isTestNet ? TestNetWallet : Wallet;

      switch (message.type) {
        case BRIDGE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET:
          const wallet = await WalletObject.newRandom();

          console.log("Created Wallet!");
          console.log({ wallet });

          emit({
            type: RESPONSE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET_RESPONSE,
            data: { wallet },
          });
          break;

        case BRIDGE_MESSAGE_TYPES.REFRESH_WALLET:
          const walletRefreshWallet = await WalletObject.fromSeed(
            message?.data?.mnemonic,
            message?.data?.derivationPath
          );

          // console.log("Refreshed Wallet!");
          // console.log({ walletRefreshWallet });

          console.log("Created/Refreshed!! Wallet!");
          console.log({ walletRefreshWallet });

          emit({
            type: RESPONSE_MESSAGE_TYPES.REFRESH_WALLET_RESPONSE,
            data: { wallet: walletRefreshWallet },
          });
          break;

        case BRIDGE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET:
          const walletScratchPad = await WalletObject.newRandom();

          emit({
            type: RESPONSE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET_RESPONSE,
            data: { wallet: walletScratchPad },
          });
          break;

        case BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS:
          const walletRequestBalance = await WalletObject.fromSeed(
            message?.data?.mnemonic,
            message?.data?.derivationPath
          );

          const balance = await walletRequestBalance.getBalance();

          const cancelWatch = walletRequestBalance.watchBalance(
            async (newBalance) => {
              // newBalance hasn't registered the included new transaction
              // So need to grab balance again
              const freshBalance = await walletRequestBalance.getBalance();

              emit({
                type: RESPONSE_MESSAGE_TYPES.RECEIVED_COINS,
                data: {
                  name: message?.data?.name,
                  balance: freshBalance?.sat,
                },
              });
            }
          );

          // Kill previous listeners once a 30s window has allowed another round of listeners to be set up
          setTimeout(async () => {
            await cancelWatch();
          }, 35000);

          emit({
            type: RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS_RESPONSE,
            data: {
              name: message?.data?.name,
              balance: balance?.sat.toString(),
              cashaddr: walletRequestBalance?.cashaddr,
            },
          });
          break;

        case BRIDGE_MESSAGE_TYPES.SEND_COINS:
          const walletSendCoins = await WalletObject.fromSeed(
            message?.data?.mnemonic,
            message?.data?.derivationPath
          );

          const txResponse = await walletSendCoins.send([
            {
              cashaddr: message?.data?.recipientCashAddr,
              value: parseInt(message?.data?.satsToSend),
              unit: "sat",
            },
          ]);
          console.log("sent coins!");
          console.log({ txResponse });
          emit({
            type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE,
            data: {
              balance: txResponse?.balance,
              tempTxId: txResponse?.txId,
            },
          });
          break;

        default:
          console.log("NOTE: Message type not recognised!!");
          break;
      }
    } catch (error) {
      console.log({ error });
      // Insufficient balance
      // Error is: Amount required was not met, 1971 satoshis needed, 1785 satoshis available
      if (error.toString()?.includes("Amount required was not met")) {
        const errorSegments = error?.toString()?.split(", ");
        const returnMessage = `${errorSegments?.[1]}, ${errorSegments?.[2]}.`;
        emit({
          type: RESPONSE_MESSAGE_TYPES.ERROR,
          data: {
            title: "❌ Not enough satoshis",
            text: `Once transaction fee is added. ${returnMessage}`,
          },
        });
        return;
      }

      emit({
        type: RESPONSE_MESSAGE_TYPES.ERROR,
        data: {
          title: "❌ No connection 📶",
          text: "Check that your Internet is online.",
        },
      });
    }
  });

  return <div style={{ height: 0 }}></div>;
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Bridge />);
