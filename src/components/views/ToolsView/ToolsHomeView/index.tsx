import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

const ToolsHomeView = () => {
  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Your Selene wallet is your rocket ship, carefully engineered to be
        simple but packed with immense power.
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Your Selene wallet is your rocket ship, carefully engineered to be
        simple but packed with immense power.
      </Text>
    </View>
  );
};

export default ToolsHomeView;
