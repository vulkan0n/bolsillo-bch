import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

function BackupView() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1}>Backup</Text>
    </View>
  );
}

export default BackupView;
