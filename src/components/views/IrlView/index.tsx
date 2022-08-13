import React from "react";
import { View, Image, Text } from "react-native";
import styles from "./styles";

function IrlView({ navigation }) {
  return (
    <View style={styles.container as any}>
      <Text style={{ color: "white" }}>To do...</Text>
      <Image
        style={styles.logo}
        source={require("../../../assets/images/logo.jpg")}
      />
    </View>
  );
}

export default IrlView;
