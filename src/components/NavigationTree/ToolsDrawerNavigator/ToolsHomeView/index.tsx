import React from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../../design/colours";
import { iconImport } from "../../../../design/icons";

const ToolsHomeView = () => {
  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Your Selene wallet is your cryptocurrency rocket ship, precisely
        engineered to be simple but packed with immense power.
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Explore the Tools section to learn more about Bitcoin Cash &
        cryptocurrency, customize your wallet and backup your money in case of
        disaster!
      </Text>
    </View>
  );
};

export default ToolsHomeView;
