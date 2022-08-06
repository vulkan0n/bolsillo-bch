import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import styles from "./styles";

function MenuView() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../assets/images/logo.jpg")}
      />
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>Developers</Text>
            </View>
          </Pressable>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>Developers</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.menuRow}>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>Developers</Text>
            </View>
          </Pressable>
          <Pressable>
            <View style={styles.pressableCard}>
              <Text>Developers</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default MenuView;
