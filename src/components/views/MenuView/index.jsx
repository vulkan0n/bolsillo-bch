import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";

function MenuView({ navigation }) {
  const onPressDevs = () => {
    navigation.navigate("Developers");
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../assets/images/logo.jpg")}
      />
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <Pressable onPress={onPressDevs}>
            <View style={styles.pressableCard}>
              <Text style={TYPOGRAPHY.h2green}>Devs</Text>
              <Text style={TYPOGRAPHY.p}>Credit, code & donations!</Text>
            </View>
          </Pressable>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>TBC</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.menuRow}>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>TBC</Text>
            </View>
          </Pressable>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>TBC</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default MenuView;
