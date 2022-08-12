import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WalletView from "../../views/WalletView";
import MenuView from "../../views/MenuView";
import DevelopersView from "../../views/menu/DevelopersView";
import TransactionSuccessView from "../../views/TransactionSuccessView";
import MusicView from "../../views/menu/CommunityView/MusicView";
import COLOURS from "../../../design/colours";
import TYPOGRAPHY from "../../../design/typography";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../design/icons";
import SPACING from "../../../design/spacing";
import styles from "./styles";
import OnlineDrawerNavigator from "./OnlineDrawerNavigator";
import ToolsDrawerNavigator from "./ToolsDrawerNavigator";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        <Tab.Screen
          name="IRL"
          component={MenuView}
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
        />
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
      {/* <Stack.Navigator>
        <Stack.Screen
          name="Wallet"
          component={WalletView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Selene BCH Wallet</Text>
            ),
          }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => <Text style={TYPOGRAPHY.header}>Menu</Text>,
          }}
        />
        <Stack.Screen
          name="Community"
          component={CommunityView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>BCH Community</Text>
            ),
          }}
        />
        <Stack.Screen
          name="Backup"
          component={BackupView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Backup</Text>
            ),
          }}
        />
        <Stack.Screen
          name="Developers"
          component={DevelopersView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => <Text style={TYPOGRAPHY.header}>Devs</Text>,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Settings</Text>
            ),
          }}
        />
        <Stack.Screen
          name="Transaction Success"
          component={TransactionSuccessView}
          options={{
            presentation: "modal",
            headerStyle: {
              backgroundColor: COLOURS.bchGreen,
            },
            headerTitle: (props) => <Text style={TYPOGRAPHY.header}></Text>,
          }}
        />
        <Stack.Screen
          name="Music"
          component={MusicView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Music</Text>
            ),
          }}
        />
      </Stack.Navigator> */}
    </NavigationContainer>
  );
};

export default NavigationTree;
