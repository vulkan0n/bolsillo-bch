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
    // emit sends message to React
    //   type: event name
    //   data: some data which will be serialized by JSON.stringify
    console.log(" React native receiving message ", { message });
    if (message.type === "hello" && message.data === 123) {
      emit({ type: "success", data: "succeeded!" });
    }
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <WebView
        // ref, source and onMessage must be passed to react-native-webview
        ref={ref}
        // Pass the source code of React app
        source={{ html: webApp }}
        onMessage={onMessage}
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Start"
            component={InitView}
            options={{
              headerStyle: {
                backgroundColor: COLOURS.black,
              },
              headerTitle: (props) => <View />,
            }}
          />
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
    </>
  );
}
