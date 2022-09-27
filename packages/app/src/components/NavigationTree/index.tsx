import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import WalletTabNavigator from "./WalletTabNavigator";
import IrlView from "./IrlView";
import { COLOURS } from "@selene/common";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@design/icons";
import styles from "./styles";
import CommunityTabNavigator from "./CommunityTabNavigator";
import ToolsDrawerNavigator from "./ToolsDrawerNavigator";
import { navigationRef } from "./rootNavigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TransactionSuccessModal from "./modals/TransactionSuccessModal";
import CustomTipModal from "./modals/CustomTipModal";
import { useSelector } from "react-redux";
import { ReduxState } from "@types";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  backgroundColor: COLOURS.black,
};

const TabNavigator = () => {
  const { isShowCommunityTab } = useSelector(
    (state: ReduxState) => state.settings
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = () => {
            switch (route?.name) {
              case "Wallet":
                return "faWallet";
              case "IRL":
                return "faEarthAmericas";
              case "Community":
                return "faUsers";
              case "Tools":
                return "faScrewdriverWrench";
              default:
                return "faBitcoinSign";
            }
          };

          return (
            <FontAwesomeIcon
              icon={iconImport(icon())}
              size={20}
              color={focused ? COLOURS.bchGreen : COLOURS.white}
            />
          );
        },
        tabBarActiveTintColor: COLOURS.bchGreen,
        tabBarInactiveTintColor: COLOURS.white,
        tabBarStyle: styles.tabBar,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Wallet"
        component={WalletTabNavigator}
        options={{
          headerStyle,
          headerStatusBarHeight: 0,
        }}
      />
      {/* <Tab.Screen
          name="IRL"
          component={IrlView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <View style={styles.header as any}>
                <FontAwesomeIcon
                  icon={iconImport("faEarthAmericas")}
                  size={20}
                  color={COLOURS.white}
                  style={{ marginRight: SPACING.ten }}
                />
                <Text style={TYPOGRAPHY.header as any}>IRL</Text>
              </View>
            ),
          }}
        />*/}
      {isShowCommunityTab && (
        <Tab.Screen
          name="Community"
          component={CommunityTabNavigator}
          options={{
            headerStyle,
            headerStatusBarHeight: 0,
          }}
        />
      )}
      <Tab.Screen
        name="Tools"
        component={ToolsDrawerNavigator}
        options={{
          headerStyle,
          headerStatusBarHeight: 0,
        }}
      />
    </Tab.Navigator>
  );
};

const linking = {
  prefixes: [
    /* your linking prefixes */
  ],
  config: {
    /* configuration for matching screens with paths */
  },
};

// Hidden stack navigator for pop up modal screens
// Wraps the visible Tab navigator
const NavigationTree = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={<Text>Loading...</Text>}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Tab Navigator" component={TabNavigator} />
        <Stack.Screen
          name="Transaction Success Modal"
          component={TransactionSuccessModal}
          options={{
            presentation: "modal",
            headerStyle: {
              backgroundColor: COLOURS.bchGreen,
            },
            headerTitle: (props) => <Text></Text>,
          }}
        />
        <Stack.Screen
          name="CustomTipModal"
          component={CustomTipModal}
          options={{
            presentation: "modal",
            headerTitle: (props) => <Text></Text>,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
