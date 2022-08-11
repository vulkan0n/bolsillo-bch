import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WalletView from "../../views/WalletView";
import MenuView from "../../views/MenuView";
import CommunityView from "../../views/menu/CommunityView";
import LearnView from "../../views/menu/LearnView";
import BackupView from "../../views/menu/BackupView";
import DevelopersView from "../../views/menu/DevelopersView";
import SettingsView from "../../views/menu/SettingsView";
import ResetWalletView from "../../views/menu/ResetWalletView";
import TransactionSuccessView from "../../views/TransactionSuccessView";
import MusicView from "../../views/menu/CommunityView/MusicView";
import COLOURS from "../../../design/colours";
import TYPOGRAPHY from "../../../design/typography";

const Stack = createNativeStackNavigator();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
          name="Learn"
          component={LearnView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Learn</Text>
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
          name="Reset Wallet"
          component={ResetWalletView}
          options={{
            headerStyle: {
              backgroundColor: COLOURS.black,
            },
            headerTitle: (props) => (
              <Text style={TYPOGRAPHY.header}>Reset Wallet</Text>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
