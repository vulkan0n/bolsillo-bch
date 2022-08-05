import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InitView from "./src/components/views/InitView";
import WalletView from "./src/components/views/WalletView";
import COLOURS from "./src/design/colours";
import TYPOGRAPHY from "./src/design/typography";
import AppLoading from "expo-app-loading";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";

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

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
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
  );
}
