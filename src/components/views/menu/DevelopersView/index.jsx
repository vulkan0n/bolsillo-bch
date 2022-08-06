import React from "react";
import { View, Image } from "react-native";
import styles from "./styles";

function DevelopersView() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
    </View>
  );
}

export default DevelopersView;
