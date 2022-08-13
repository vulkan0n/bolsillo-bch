import React from "react";
import { View, ScrollView } from "react-native";
import styles from "./styles";
import CryptoDenominated from "./CryptoDenominated";
import TestNet from "./TestNet";
import RightHandedMode from "./RightHandedMode";

const SettingsView = () => {
  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <CryptoDenominated />
        <RightHandedMode />
        <TestNet />
        <TestNet />
        <TestNet />
        <TestNet />
        <TestNet />
      </View>
    </ScrollView>
  );
};

export default SettingsView;
