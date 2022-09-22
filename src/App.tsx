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
import { RESPONSE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./redux/store";
import persistor from "./redux/persistor";
import Toast from "react-native-toast-message";
import toastConfig from "./config/toast";
import preloadMainNetScript from "./config/preloadMainNetScript";
import { WalletType } from "./types";
import {
  createDefaultWallet,
  updateNewWalletScratchPadDetails,
  updateWalletBalance,
  updateWalletCashAddr,
  importWalletTransactionHistory,
} from "./redux/reducers/walletManagerReducer";
import {
  updateTransactionPadIsSendingCoins,
  clearTransactionPad,
} from "./redux/reducers/transactionPadReducer";
import { navigate } from "./components/NavigationTree/rootNavigation";
import { updateLocalLastSentTransactionHash } from "./redux/reducers/localReducer";

interface TransactionHistoryTxType {
  height: number;
  tx_hash: string;
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
    transactionHistory?: TransactionHistoryTxType[];
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
    (message: BridgeResponseMessage) => {
      // console.log("Bridge Response Message: ", message);
      switch (message.type) {
        case RESPONSE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET_RESPONSE:
          store.dispatch(
            createDefaultWallet({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET_RESPONSE:
          store.dispatch(
            updateNewWalletScratchPadDetails({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS_RESPONSE:
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

          Toast.show({
            type: "customSuccess",
            props: {
              title: "Received Bitcoin Cash",
              text: "Thanks Satoshi.",
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_DETECTED:
          store.dispatch(
            updateWalletBalance({
              name: message.data.name,
              balance: message.data.balance,
            })
          );

          store.dispatch(
            importWalletTransactionHistory({
              name: message?.data?.name,
              transactionHistory: message?.data?.transactionHistory,
            })
          );

          const history = message?.data?.transactionHistory;
          const lastTransaction = history?.[history.length - 1];
          const lastTransactionHash = lastTransaction?.tx_hash;

          store.dispatch(
            updateLocalLastSentTransactionHash({
              lastSentTransactionHash: lastTransactionHash || "",
            })
          );

          store.dispatch(clearTransactionPad());

          navigate("Transaction Success");
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <View style={{ height: 0 }}>
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
        </View>
        {isWebViewLoaded && <BackgroundIntervals />}
        <NavigationTree />
        <Toast config={toastConfig} />
      </PersistGate>
    </Provider>
  );
}
