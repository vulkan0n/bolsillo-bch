import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InitView from "./src/components/views/InitView";
import WalletView from "./src/components/views/WalletView";
import COLOURS from "./src/design/colours";
import TYPOGRAPHY from "./src/design/typography";
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
import webApp from "./WebApp";
import { RESPONSE_MESSAGE_TYPES } from "./src/utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./src/redux/store";
import persistor from "./src/redux/persistor";
import ACTION_TYPES from "./src/redux/actionTypes";

const Stack = createNativeStackNavigator();

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
  const { ref, onMessage, emit } = useWebViewMessage((message) => {
    // console.log("Bridge Response Message: ", message);
    switch (message.type) {
      case RESPONSE_MESSAGE_TYPES.CREATE_WALLET_RESPONSE:
        store.dispatch({
          type: ACTION_TYPES.STORE_WALLET,
          payload: {
            wallet: message.data.wallet,
          },
        });
        break;
      default:
        break;
      // code block
    }
  });

  if (!fontsLoaded) {
    return null;
  }

  const preloadMainNetScript = `      
      console.log('Loading up the Mainnet.cash script...')

      async function loadScript(url) {
        let response = await fetch(url);
        let script = await response.text();
        eval(script);
      }

      let scriptUrl = 'https://cdn.mainnet.cash/mainnet-0.1.7.js'
      loadScript(scriptUrl);

      true; // note: this is required, or you'll sometimes get silent failures
`;

  const state = store?.getState();
  const isExistingWallet = Object.keys(state.wallet).length > 0;
  console.log({ state, isExistingWallet });

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <View style={{ height: 0 }}>
          <WebView
            ref={ref}
            onMessage={onMessage}
            source={{ html: webApp }}
            injectedJavaScript={preloadMainNetScript}
          />
        </View>
        <NavigationContainer>
          <Stack.Navigator>
            {!isExistingWallet && (
              <Stack.Screen
                name="Start"
                component={InitView}
                initialParams={{
                  emit,
                }}
                options={{
                  headerStyle: {
                    backgroundColor: COLOURS.black,
                  },
                  headerTitle: (props) => <View />,
                }}
              />
            )}
            <Stack.Screen
              name="Wallet"
              component={WalletView}
              options={{
                headerStyle: {
                  backgroundColor: COLOURS.black,
                },
                headerTitle: (props) => (
                  <Text style={TYPOGRAPHY.header}>Wallet</Text>
                ),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
