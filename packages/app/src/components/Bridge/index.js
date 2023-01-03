import React, { useState } from "react";
import {
  webViewRender,
  emit,
  useNativeMessage,
} from "react-native-react-bridge/lib/web";
import {
  BRIDGE_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
} from "@selene-wallet/app/src/utils/bridgeMessages";
import {
  sendCoins,
  getWalletHistory,
  getSeleneAddressAtIndex,
} from "./actions";

const Bridge = () => {
  console.log("Bridge loaded.");
  const [previousBalance, setPreviousBalance] = useState(null);
  const [balanceWatchWalletName, setBalanceWatchWalletName] = useState("");
  // useNativeMessage hook receives message from React Native

  // wallet.named(x) is unavailable
  // Safari (has to be used for iOS debugging)
  // Unfortunately, Safari is also non standard,
  // and it does not allow access to IndexedDB in an iframe/WebView
  // Thus wallet needs to be retrieve from seed phrase every time
  useNativeMessage(async (message) => {
    // console.log("Bridge received message: ", message);

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

        case BRIDGE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET:
          const walletScratchPad = await WalletObject.newRandom();

          emit({
            type: RESPONSE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET_RESPONSE,
            data: { wallet: walletScratchPad },
          });
          break;

        case BRIDGE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX:
          const { mnemonic, hdWalletIndex } = message?.data;
          const seleneAddress = await getSeleneAddressAtIndex(
            WalletObject,
            mnemonic,
            hdWalletIndex
          );
          // console.log({ seleneAddress });
          emit({
            type: RESPONSE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX_RESPONSE,
            data: { name: message?.data?.name, seleneAddress },
          });
          break;

        //   // find out the latest non empty address and set it as next receiving address
        //   let nonZeroBalanceAddressIndex = 0;
        //   balances.forEach((balance, index) => {
        //     if (balance > 0) {
        //       nonZeroBalanceAddressIndex = index;
        //     }
        //   });
        //   const depositAddrIndex = nonZeroBalanceAddressIndex + 1;
        //   const depositWallet = await WalletObject.fromSeed(
        //     message?.data?.mnemonic,
        //     `m/44'/0'/0'/0/${depositAddrIndex}`
        //   );
        //   const depositAddress = depositWallet.cashaddr;

        //   const watchKey = `${message?.data?.mnemonic}_${message?.data?.depositAddrIndex}`;
        //   const isActiveWatcher = watchKey === balanceWatchWalletName;
        //   console.log(
        //     {
        //       isActiveWatcher,
        //       balanceWatchWalletName,
        //     },
        //     "message?.data?.name",
        //     message?.data?.name
        //   );

        //   if (!isActiveWatcher) {
        //     console.log("setting up new balance watcher");
        //     // newBalance hasn't registered the included new transaction
        //     // So need to grab balance again

        //     const watchAddressCallback = async () => {
        //       const response = await getHDWalletInfo();
        //       const freshBalance = response.totalBalance;

        //       // Balance changed upwards = coins received
        //       // Balance changed downwards = coins sent
        //       const isReceivedCoins =
        //         parseInt(freshBalance) > parseInt(totalBalance);
        //       console.log("Did I receive coins?");
        //       console.log({
        //         freshBalance,
        //         totalBalance,
        //         isReceivedCoins,
        //       });
        //       if (isReceivedCoins) {
        //         emit({
        //           type: RESPONSE_MESSAGE_TYPES.RECEIVED_COINS,
        //           data: {
        //             name: message?.data?.name,
        //             balance: freshBalance,
        //           },
        //         });
        //       } else {
        //         // Balance change caused by sending coins
        //         console.log("registering successful send");
        //         // const transactionHistory =
        //         //   await walletRequestBalance.getHistory("sat", 0, 100);

        //         emit({
        //           type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE,
        //           data: {
        //             name: message?.data?.name,
        //             balance: freshBalance,
        //             // transactionHistory,
        //           },
        //         });
        //       }
        //     };
        //     // get a transient wallet's provider
        //     const provider = (await WalletObject.newRandom()).provider;
        //     // subscribe to all addresses, ignore allocated but not yet used addresses
        //     const watchAddresses = addresses.filter(
        //       (_, index) => index <= depositAddrIndex
        //     );
        //     watchAddresses.map((address) =>
        //       provider.watchAddressStatus(address, watchAddressCallback)
        //     );

        //     setBalanceWatchWalletName(watchKey);
        //   }

        //   // update total wallet balance and receive address in UI
        //   emit({
        //     type: RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS_RESPONSE,
        //     data: {
        //       name: message?.data?.name,
        //       balance: totalBalance,
        //       cashaddr: depositAddress,
        //       maxAddressIndex: depositAddrIndex,
        //       coins: coins.flat(1),
        //     },
        //   });
        //   break;

        case BRIDGE_MESSAGE_TYPES.SEND_COINS:
          console.log("received bridge SEND_COINS");
          await sendCoins(WalletObject, message);
          break;

        case BRIDGE_MESSAGE_TYPES.GET_WALLET_HISTORY:
          await getWalletHistory(WalletObject, message);
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

      // Generic connection errors were just annoying and often inconsequential
      // due to unreliable bridge
      // emit({
      //   type: RESPONSE_MESSAGE_TYPES.ERROR,
      //   data: {
      //     title: "❌ No connection 📶",
      //     text: "Check that your Internet is online.",
      //   },
      // });
    }
  });

  return <div style={{ height: 0 }}></div>;
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Bridge />);
