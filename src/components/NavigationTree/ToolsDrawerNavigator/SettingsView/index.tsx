import React from "react";
import { View } from "react-native";
import styles from "./styles";
import CryptoDenominated from "./CryptoDenominated";
import TestNet from "./TestNet";
import RightHandedMode from "./RightHandedMode";

const SettingsView = () => {
  return (
    <View style={styles.container as any}>
      <CryptoDenominated />
      <RightHandedMode />
      <TestNet />
      <TestNet />
      <TestNet />
      <TestNet />
      <TestNet />
    </View>
  );
};

export default SettingsView;
