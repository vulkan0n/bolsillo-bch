import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons/faBookOpenReader";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";
import COLOURS from "../../../design/colours";

function MenuView({ navigation }) {
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
      <View style={styles.menuContainer as any}>
        <View style={styles.menuRow as any}>
          <Pressable onPress={onPressLearn}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={faBookOpenReader}
                  size={45}
                  color={COLOURS.bchGreen}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen as any}>Learn</Text>
              <Text style={TYPOGRAPHY.pWhite as any}>
                Understand Bitcoin Cash.
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={onPressBackup}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={faPiggyBank}
                  size={45}
                  color={COLOURS.bchGreen}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen as any}>Backup</Text>
              <Text style={TYPOGRAPHY.pWhite as any}>
                Keep your money safe!
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.menuRow as any}>
          <Pressable onPress={onPressDevs}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={faCode}
                  size={45}
                  color={COLOURS.bchGreen}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen as any}>Devs</Text>
              <Text style={TYPOGRAPHY.pWhite as any}>
                Credit, code & donations!
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={onPressSettings}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={faGears}
                  size={45}
                  color={COLOURS.bchGreen}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen as any}>Settings</Text>
              <Text style={TYPOGRAPHY.pWhite as any}>
                Currency, unit display, etc.
              </Text>
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
