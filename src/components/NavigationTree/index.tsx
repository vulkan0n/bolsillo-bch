import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import WalletView from "./WalletStackNavigator/WalletView";
import IrlView from "./IrlView";
import COLOURS from "../../design/colours";
import TYPOGRAPHY from "../../design/typography";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../design/icons";
import SPACING from "../../design/spacing";
import styles from "./styles";
import OnlineDrawerNavigator from "./OnlineDrawerNavigator";
import ToolsDrawerNavigator from "./ToolsDrawerNavigator";

const Tab = createBottomTabNavigator();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icon = () => {
              switch (route?.name) {
                case "Wallet":
                  return "faWallet";
                case "IRL":
                  return "faEarthAmericas";
                case "Online":
                  return "faUsers";
                case "Tools":
                  return "faScrewdriverWrench";
                default:
                  return "";
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
          component={WalletView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <View style={styles.header as any}>
                <FontAwesomeIcon
                  icon={iconImport("faWallet")}
                  size={20}
                  color={COLOURS.white}
                  style={{ marginRight: SPACING.ten }}
                />
                <Text style={TYPOGRAPHY.header as any}>Wallet</Text>
              </View>
            ),
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
        <Tab.Screen
          name="Online"
          component={OnlineDrawerNavigator}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <View style={styles.header as any}>
                <FontAwesomeIcon
                  icon={iconImport("faUsers")}
                  size={20}
                  color={COLOURS.white}
                  style={{ marginRight: SPACING.ten }}
                />
                <Text style={TYPOGRAPHY.header as any}>Online</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsDrawerNavigator}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <View style={styles.header as any}>
                <FontAwesomeIcon
                  icon={iconImport("faScrewdriverWrench")}
                  size={20}
                  color={COLOURS.white}
                  style={{ marginRight: SPACING.ten }}
                />
                <Text style={TYPOGRAPHY.header as any}>Tools</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
