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
        Your Selene wallet is your rocket ship, carefully engineered to be
        simple but packed with immense power.
      </Text>
      <View style={styles.iconContainer}>
        <FontAwesomeIcon
          icon={iconImport("faMoon")}
          size={50}
          color={COLOURS.bchGreen}
        />
      </View>
    </View>
  );
};

export default ToolsHomeView;
