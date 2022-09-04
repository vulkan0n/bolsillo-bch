import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import COLOURS from "@design/colours";
import { iconImport } from "@design/icons";
import styles from "./styles";

const Stack = createNativeStackNavigator();

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReceivePad from "./ReceivePad";
import ReceiveNumPad from "./ReceiveNumPad";
import SendView from "./SendView";
import AvailableBalance from "./SendView/AvailableBalance";

const Tab = createMaterialTopTabNavigator();

function WalletTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={"Receive"}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = () => {
            switch (route?.name) {
              case "Send":
                return "faPaperPlane";
              case "Receive":
                return "faBitcoinSign";
              default:
                return "faBitcoinSign";
            }
          };

          return (
            <FontAwesomeIcon
              icon={iconImport(icon())}
              size={20}
              color={focused ? COLOURS.black : COLOURS.bchGreen}
            />
          );
        },
        tabBarActiveTintColor: COLOURS.black,
        tabBarInactiveTintColor: COLOURS.bchGreen,
        tabBarStyle: styles.tabBar,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Send" component={SendView} />
      <Tab.Screen name="Receive" component={ReceivePad} />
    </Tab.Navigator>
  );
}

const WalletStack = () => (
  <>
    <AvailableBalance />
    <Stack.Navigator
      screenOptions={({ route }) => ({
        header: () => false,
      })}
    >
      <Stack.Screen
        name="Wallet Home"
        component={WalletTabNavigator}
        options={{
          headerTitle: (props) => {
            return <View style={{ height: 0 }}></View>;
          },
        }}
      />
      <Stack.Screen
        name="Receive Num Pad"
        component={ReceiveNumPad}
        options={{
          headerTitle: (props) => {
            return <View style={{ height: 0 }}></View>;
          },
        }}
      />
    </Stack.Navigator>
  </>
);

export default WalletStack;
