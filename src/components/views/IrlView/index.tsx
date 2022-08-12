import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import COLOURS from "../../../design/colours";
import PressableCard from "../../atoms/PressableCard";

function IrlView({ navigation }) {
  const onPressCommunity = () => {
    navigation.navigate("Community");
  };

  const onPressLearn = () => {
    navigation.navigate("Learn");
  };

  const onPressBackup = () => {
    navigation.navigate("Backup");
  };

  const onPressDevs = () => {
    navigation.navigate("Developers");
  };

  const onPressSettings = () => {
    navigation.navigate("Settings");
  };

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
