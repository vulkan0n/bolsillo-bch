import * as React from "react";
import { DeviceEventEmitter, View, Text } from "react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import WebView from "react-native-webview";
import { useWebViewMessage } from "react-native-react-bridge";
import NavigationTree from "./components/NavigationTree";
import BackgroundIntervals from "./components/BackgroundIntervals";
import Bridge from "./components/Bridge";
import { RESPONSE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./redux/store";
import persistor from "./redux/persistor";
import Toast from "react-native-toast-message";
import toastConfig from "./config/toast";
import preloadMainNetScript from "./config/preloadMainNetScript";
import {
  WalletType,
  CoinType,
  SeleneAddressType,
} from "@selene-wallet/common/dist/types";
import {
  createDefaultWallet,
  updateNewWalletScratchPadDetails,
  updateWalletBalance,
  updateWalletCashAddr,
  importWalletTransactionHistory,
  updateWalletMaxAddressIndex,
  updateWalletCoins,
  mergeSeleneAddressToWallet,
} from "./redux/reducers/walletManagerReducer";
import {
  updateTransactionPadIsSendingCoins,
  clearTransactionPad,
} from "./redux/reducers/transactionPadReducer";
import { navigate } from "./components/NavigationTree/rootNavigation";
import { updateLocalLastSentTransactionHash } from "./redux/reducers/localReducer";
import { IS_WEB } from "@selene-wallet/app/src/utils/isWeb";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./apolloClient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import COLOURS from "@selene-wallet/common/design/colours";
import { Audio } from "expo-av";
import { ONE_SECOND } from "@selene-wallet/common/dist/utils/consts";

interface TransactionHistoryTxType {
  blockheight: number;
  txn: string;
  transactionId: string;
  balance: number;
  fee: number;
  from: string;
  to: string;
  index: number;
  unit: string;
  value: number;
}

interface BridgeResponseMessage {
  type: string;
  data: {
    name?: string;
    wallet?: WalletType;
    balance?: string;
    lastSentTransactionHash?: string;
    title?: string;
    text?: string;
    cashaddr?: string;
    maxAddressIndex?: number;
    coins?: CoinType[];
    transactionHistory?: {
      transactions: TransactionHistoryTxType[];
    };
    seleneAddress: SeleneAddressType;
  };
}

export default function App() {
  // For the list of possible font faces
  // https://github.com/expo/google-fonts/tree/master/font-packages/montserrat
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  // useWebViewMessage hook create props for WebView and handle communication
  // The argument is callback to receive message from React
  const { ref, onMessage, emit } = useWebViewMessage(
    async (message: BridgeResponseMessage) => {
      // console.log("Bridge Response Message: ", message);
      switch (message.type) {
        case RESPONSE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET_RESPONSE:
          store.dispatch(
            createDefaultWallet({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
              maxAddressIndex: 0,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET_RESPONSE:
          store.dispatch(
            updateNewWalletScratchPadDetails({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
              maxAddressIndex: 0,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX_RESPONSE:
          console.log("Received back a Selene Address from bridge!");
          console.log("message.data", message.data);
          store.dispatch(
            mergeSeleneAddressToWallet({
              name: message.data.name,
              seleneAddress: message.data.seleneAddress,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS_RESPONSE:
          // console.log("REQUEST_BALANCE_AND_ADDRESS_RESPONSE ----");
          // console.log("message.data: ", message.data);
          // console.log("---");
          store.dispatch(
            updateWalletBalance({
              name: message.data.name,
              balance: message.data.balance,
            })
          );
          store.dispatch(
            updateWalletCashAddr({
              name: message.data.name,
              cashaddr: message.data.cashaddr,
            })
          );
          store.dispatch(
            updateWalletMaxAddressIndex({
              name: message.data.name,
              maxAddressIndex: message.data.maxAddressIndex,
            })
          );
          store.dispatch(
            updateWalletCoins({
              name: message.data.name,
              coins: message.data?.coins,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_FAIL:
          store.dispatch(
            updateTransactionPadIsSendingCoins({
              isSendingCoins: false,
            })
          );

          const text = message?.data?.text ?? "";
          Toast.show({
            type: "customError",
            props: {
              title: "Transaction failed",
              text,
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.GET_WALLET_HISTORY_RESPONSE:
          store.dispatch(
            importWalletTransactionHistory({
              name: message?.data?.name,
              transactionHistory: message?.data?.transactionHistory,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.ERROR:
          Toast.show({
            type: "customError",
            props: {
              title: message?.data?.title ?? "",
              text: message?.data?.text ?? "",
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.RECEIVED_COINS:
          store.dispatch(
            updateWalletBalance({
              name: message.data.name,
              balance: message.data.balance,
            })
          );

          const { sound } = await Audio.Sound.createAsync(
            require("./receive.mp3")
          );

          Toast.show({
            type: "customSuccess",
            props: {
              title: "Received Bitcoin Cash",
              text: "Peer-to-peer electronic cash!",
            },
          });

          // Sound duration: 1 second
          await sound.playAsync();
          setTimeout(() => {
            // Unload sound to prevent memory leak
            sound.unloadAsync();
          }, ONE_SECOND * 3);

          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_DETECTED:
          store.dispatch(
            updateWalletBalance({
              name: message.data.name,
              balance: message.data.balance,
            })
          );

          if (message?.data?.transactionHistory) {
            store.dispatch(
              importWalletTransactionHistory({
                name: message?.data?.name,
                transactionHistory: message?.data?.transactionHistory,
              })
            );

            const history = message?.data?.transactionHistory?.transactions;
            const lastTransaction = history?.[history.length - 1];
            const lastTransactionHash = lastTransaction?.txn;

            store.dispatch(
              updateLocalLastSentTransactionHash({
                lastSentTransactionHash: lastTransactionHash || "",
              })
            );
          }

          const isSendingCoins =
            store.getState()?.transactionPad?.isSendingCoins;

          if (isSendingCoins) {
            navigate("Transaction Success Modal");
          }

          store.dispatch(clearTransactionPad());
          break;

        default:
          break;
      }
    }
  );

  const [isWebViewLoaded, setIsWebViewLoaded] = React.useState(false);

  React.useEffect(() => {
    // Listens for components that need to send a message to the Bridge
    DeviceEventEmitter.addListener("event.emitEvent", (event) => {
      emit(event);
    });

    const unsubscribe = () => {
      DeviceEventEmitter.removeAllListeners();
    };

    return () => unsubscribe();
  }, []);

  const onWebViewLoad = () => {
    setIsWebViewLoaded(true);
  };

  // Only app versions need to be empty while waiting for fonts to load
  if (!IS_WEB && !fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <ApolloProvider client={apolloClient}>
          <View style={{ flex: 1, backgroundColor: COLOURS.black }}>
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 0 }}>
                  {!IS_WEB && (
                    <WebView
                      ref={ref}
                      onMessage={onMessage}
                      source={{ html: Bridge }}
                      injectedJavaScript={preloadMainNetScript}
                      allowFileAccess={true}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      onLoad={onWebViewLoad}
                    />
                  )}
                </View>
                {isWebViewLoaded && <BackgroundIntervals />}
                <NavigationTree />
                <Toast config={toastConfig} />
              </SafeAreaView>
            </SafeAreaProvider>
          </View>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}
