import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReceivePad from "./ReceivePad";
import ReceiveNumPad from "./ReceiveNumPad";
import SendView from "./SendView";
import AvailableBalance from "./SendView/AvailableBalance";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectIsActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import CreatingWallet from "./CreatingWallet";
import TabBar from "@selene-wallet/app/src/components/atoms/TabBar";

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function WalletTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar isDarkMode={false} {...props} />}
      initialRouteName={"Receive"}
    >
      <Tab.Screen name="Send" component={SendView} />
      <Tab.Screen name="Receive" component={ReceivePad} />
    </Tab.Navigator>
  );
}

const WalletStack = () => {
  const isActiveWallet = useSelector((state: ReduxState) =>
    selectIsActiveWallet(state)
  );

  if (!isActiveWallet) {
    return <CreatingWallet />;
  }

  return (
    <>
      <AvailableBalance />
      <Stack.Navigator
        screenOptions={({ route }) => ({
          header: () => false,
        })}
      >
        <Stack.Screen name="Wallet Home" component={WalletTabNavigator} />
        <Stack.Screen name="Receive Num Pad" component={ReceiveNumPad} />
      </Stack.Navigator>
    </>
  );
};

export default WalletStack;
