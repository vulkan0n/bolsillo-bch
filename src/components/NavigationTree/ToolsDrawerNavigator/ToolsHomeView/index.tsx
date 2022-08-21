import React from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

const ToolsHomeView = () => {
  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Your Selene wallet is your cryptocurrency rocket ship, precisely
        engineered to be simple but packed with immense power.
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Explore the Tools section to customize your wallet and backup your money
        in case of disaster!
      </Text>
    </View>
  );
};

export default ToolsHomeView;
