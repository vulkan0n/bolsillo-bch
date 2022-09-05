import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Animated, TouchableOpacity, Text } from "react-native";
import COLOURS from "@design/colours";
import { iconImport } from "@design/icons";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReceivePad from "./ReceivePad";
import ReceiveNumPad from "./ReceiveNumPad";
import SendView from "./SendView";
import AvailableBalance from "./SendView/AvailableBalance";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../types";
import { selectIsActiveWallet } from "../../../redux/selectors";
import CreatingWallet from "./CreatingWallet";

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MyTabBar({ state, descriptors, navigation, position }) {
  return (
    <View style={{ flexDirection: "row" }}>
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

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Animated.Text style={{ opacity }}>{label}</Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function WalletTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      initialRouteName={"Receive"}
      // screenOptions={({ route, navigation }) => {
      //   const isFocused = navigation.isFocused();
      //   return {
      //     tabBarIcon: ({ focused, color, size }) => {
      //       const icon = () => {
      //         switch (route?.name) {
      //           case "Send":
      //             return "faPaperPlane";
      //           case "Receive":
      //             return "faBitcoinSign";
      //           default:
      //             return "faBitcoinSign";
      //         }
      //       };

      //       return (
      //         <FontAwesomeIcon
      //           icon={iconImport(icon())}
      //           size={20}
      //           // Unusual double negative, but it makes the animation
      //           // slightly smoother in this component
      //           color={!focused ? COLOURS.bchGreen : COLOURS.black}
      //         />
      //       );
      //     },
      //     tabBarActiveTintColor: COLOURS.black,
      //     tabBarInactiveTintColor: COLOURS.bchGreen,
      //     tabBarStyle: styles.tabBar,
      //     headerShadowVisible: false,
      //     tabBarLabelStyle: {
      //       ...TYPOGRAPHY.p,
      //       marginBottom: 0,
      //       color: isFocused ? COLOURS.black : COLOURS.bchGreen,
      //       textTransform: "capitalise",
      //     },
      //   };
      // }}
    >
      <Tab.Screen
        name="Send"
        component={SendView}
        options={{
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 100,
          },
        }}
      />
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
};

export default WalletStack;
