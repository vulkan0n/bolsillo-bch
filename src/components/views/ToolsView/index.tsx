import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";

const ToolsView = () => {
  return (
    <View style={styles.container as any}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1 as any}>Tools</Text>
    </View>
  );
};

export default ToolsView;
