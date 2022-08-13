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
import NavigationTree from "./src/components/NavigationTree";
import Bridge from "./src/components/Bridge";
import { RESPONSE_MESSAGE_TYPES } from "./src/utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./src/redux/store";
import persistor from "./src/redux/persistor";
import Toast from "react-native-toast-message";
import toastConfig from "./src/config/toast";
import preloadMainNetScript from "./src/config/preloadMainNetScript";
import {
  updateBridgeBalance,
  updateBridgeTempTxId,
  updateBridgeWallet,
} from "./src/redux/reducers/bridgeReducer";
import { WalletType } from "./src/types";

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

  interface BridgeResponseMessage {
    type: string;
    data: {
      wallet?: WalletType;
      balance?: string;
      tempTxId?: string;
      title?: string;
      text?: string;
    };
  }

  // useWebViewMessage hook create props for WebView and handle communication
  // The argument is callback to receive message from React
  const { ref, onMessage, emit } = useWebViewMessage(
    (message: BridgeResponseMessage) => {
      // console.log("Bridge Response Message: ", message);
      switch (message.type) {
        case RESPONSE_MESSAGE_TYPES.CREATE_WALLET_RESPONSE:
          store.dispatch(updateBridgeWallet({ wallet: message.data.wallet }));
          break;

        // Note: Responds the same as CREATE_WALLET_RESPONSE
        // The difference is on the other side of the bridge
        // Generating a new seed vs refreshing from seed
        case RESPONSE_MESSAGE_TYPES.REFRESH_WALLET_RESPONSE:
          store.dispatch(updateBridgeWallet({ wallet: message.data.wallet }));
          break;

        case RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_RESPONSE:
          store.dispatch(
            updateBridgeBalance({ balance: message.data.balance })
          );
          console.log({ message });
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE:
          store.dispatch(
            updateBridgeBalance({ balance: message.data.balance })
          );
          store.dispatch(
            updateBridgeTempTxId({ tempTxId: message.data.tempTxId })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.ERROR:
          Toast.show({
            type: "customError",
            props: {
              title: message?.data?.title,
              text: message?.data?.text,
            },
          });
          break;

        default:
          break;
      }
    }
  );

  // Listens for components that need to send a message to the Bridge
  DeviceEventEmitter.addListener("event.emitEvent", (event) => emit(event));

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
          />
        </View>
        <NavigationTree />
        <Toast config={toastConfig} />
      </PersistGate>
    </Provider>
  );
}
