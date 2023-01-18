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
import Button from "./components/atoms/Button";
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
  importWalletTransactionHistory,
  mergeSeleneAddressToWallet,
  updateSpendingWalletAddressesAndUTXOs,
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

export interface TransactionHistoryTxType {
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
    spentUTXOs: CoinType[];
    transactionHistory?: {
      transactions: TransactionHistoryTxType[];
    };
    seleneAddress: SeleneAddressType;
    updatedChangeAddress: SeleneAddressType;
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

  const [isBridgeReloading, setIsBridgeReloading] = React.useState(false);
  const [bridgeScript, setBridgeScript] = React.useState(preloadMainNetScript);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => {
    console.log("forcing an application reset to rerender bridge");
    updateState({});
    setIsBridgeReloading(true);
    setIsBridgeReloading(false);
    setBridgeScript("");
    setBridgeScript(preloadMainNetScript);
  }, []);

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
          store.dispatch(
            mergeSeleneAddressToWallet({
              name: message.data.name,
              seleneAddress: message.data.seleneAddress,
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

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_SUBMITTED:
          console.log("got back send_coins_submitted");
          const isSendingCoins =
            store.getState()?.transactionPad?.isSendingCoins;

          if (isSendingCoins) {
            navigate("Transaction Success Modal");
          }

          store.dispatch(
            updateTransactionPadIsSendingCoins({
              isSendingCoins: false,
            })
          );

          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE:
          console.log("got back send coins response");
          console.log("message.data", message?.data);

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

          store.dispatch(
            updateSpendingWalletAddressesAndUTXOs({
              name: message?.data?.name,
              spentUTXOs: message?.data?.spentUTXOs,
              updatedChangeAddress: message?.data?.updatedChangeAddress,
            })
          );
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

  const onInjectScript = () => {
    // this.ref.injectJavaScript({});
    console.log("this.ref", this.ref);
    this.ref.injectJavaScript(bridgeScript);
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
            <Text>Time to force some updates</Text>
            <Button onPress={forceUpdate}>Force re-render</Button>
            <Button onPress={onInjectScript}>Inject script</Button>
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100, backgroundColor: "#C1C1C1" }}>
                  {!IS_WEB && !isBridgeReloading && (
                    <WebView
                      ref={(r) => (this.ref = r)}
                      onMessage={onMessage}
                      source={{ html: Bridge }}
                      // injectedJavaScript={bridgeScript}
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
