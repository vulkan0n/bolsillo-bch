import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";

function OnlineView({ navigation }) {
  return (
    <View style={styles.container as any}>
      <Text style={{ color: "white" }}>To do...</Text>
    </View>
  );
}

export default OnlineView;
