import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import COLOURS from "../../../design/colours";
import { iconImport } from "../../../design/icons";
import SPACING from "../../../design/spacing";
import TYPOGRAPHY from "../../../design/typography";
import WalletView from "./WalletView";
import styles from "./styles";

const Stack = createNativeStackNavigator();

const WalletStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Wallet"
      component={WalletView}
      options={{
        headerStyle: {
          backgroundColor: COLOURS.black,
        },
        headerTitle: (props) => {
          return (
            <View style={styles.header as any}>
              <FontAwesomeIcon
                icon={iconImport("faWallet")}
                size={20}
                color={COLOURS.white}
                style={{ marginRight: SPACING.ten }}
              />
              <Text style={TYPOGRAPHY.header as any}>Wallet</Text>
            </View>
          );
        },
      }}
    />
  </Stack.Navigator>
);

export default WalletStack;
