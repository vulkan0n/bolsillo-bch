import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMugSaucer } from "@fortawesome/free-solid-svg-icons/faMugSaucer";
import COLOURS from "../../../design/colours";

function MenuView({ navigation }) {
  const onPressDevs = () => {
    navigation.navigate("Developers");
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <Pressable onPress={onPressDevs}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon
                  icon={faMugSaucer}
                  size={45}
                  color={COLOURS.black}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen}>Devs</Text>
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
      <Image
        style={styles.logo}
        source={require("../../../assets/images/logo.jpg")}
      />
    </View>
  );
}

export default MenuView;
