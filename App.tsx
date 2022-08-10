import * as React from "react";
import { View, Text } from "react-native";
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
import NavigationTree from "./src/components/macro/NavigationTree";
import Bridge from "./src/components/macro/Bridge";
import { RESPONSE_MESSAGE_TYPES } from "./src/utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./src/redux/store";
import persistor from "./src/redux/persistor";
import ACTION_TYPES from "./src/redux/actionTypes";
import Toast from "react-native-toast-message";
import toastConfig from "./src/config/toast";
import preloadMainNetScript from "./src/config/preloadMainNetScript";

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
      wallet?: {};
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
          store.dispatch({
            type: ACTION_TYPES.UDPATE_WALLET,
            payload: {
              wallet: message.data.wallet,
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_RESPONSE:
          store.dispatch({
            type: ACTION_TYPES.UPDATE_BALANCE,
            payload: {
              balance: message.data.balance,
            },
          });
          console.log({ message });
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE:
          store.dispatch({
            type: ACTION_TYPES.UPDATE_BALANCE,
            payload: {
              balance: message.data.balance,
            },
          });
          store.dispatch({
            type: ACTION_TYPES.UPDATE_TEMP_TXID,
            payload: {
              tempTxId: message.data.tempTxId,
            },
          });
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
        <NavigationTree emit={emit} />
        <Toast config={toastConfig} />
      </PersistGate>
    </Provider>
  );
}
