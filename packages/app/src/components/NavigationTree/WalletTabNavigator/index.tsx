import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { TouchableOpacity, Text } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReceivePad from "./ReceivePad";
import ReceiveNumPad from "./ReceiveNumPad";
import SendView from "./SendView";
import AvailableBalance from "./SendView/AvailableBalance";
import { useSelector } from "react-redux";
import SPACING from "@selene-wallet/common/design/spacing";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectIsActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import CreatingWallet from "./CreatingWallet";
import TabBar from "@selene-wallet/app/src/components/atoms/TabBar";

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MyTabBar({ state, descriptors, navigation, position }) {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const inputRange = state.routes.map((_, i) => i);
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((i) => (i === index ? 1 : 0)),
        });

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
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: SPACING.five,
              height: 50,
            }}
          >
            <View
              style={{
                marginRight: SPACING.five,
                justifyContent: "center",
              }}
            >
              <FontAwesomeIcon
                icon={iconImport(icon())}
                size={20}
                // Unusual double negative, but it makes the animation
                // slightly smoother in this component
                color={isFocused ? COLOURS.bchGreen : COLOURS.black}
              />
            </View>

            <Text
              style={{
                ...TYPOGRAPHY.p,
                marginBottom: 0,
                color: isFocused ? COLOURS.bchGreen : COLOURS.black,
                marginLeft: SPACING.five,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
