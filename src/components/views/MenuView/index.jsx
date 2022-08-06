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
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <Pressable onPress={onPressLearn}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon
                  icon={faBookOpenReader}
                  size={45}
                  color={COLOURS.black}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen}>Learn</Text>
              <Text style={TYPOGRAPHY.p}>Understand Bitcoin Cash.</Text>
            </View>
          </Pressable>
          <Pressable onPress={onPressBackup}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon
                  icon={faPiggyBank}
                  size={45}
                  color={COLOURS.black}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen}>Backup</Text>
              <Text style={TYPOGRAPHY.p}>Keep your money safe!</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.menuRow}>
          <Pressable onPress={onPressDevs}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon
                  icon={faCode}
                  size={45}
                  color={COLOURS.black}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen}>Devs</Text>
              <Text style={TYPOGRAPHY.p}>Credit, code & donations!</Text>
            </View>
          </Pressable>
          <Pressable onPress={onPressSettings}>
            <View style={styles.pressableCard}>
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon
                  icon={faGears}
                  size={45}
                  color={COLOURS.black}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen}>Settings</Text>
              <Text style={TYPOGRAPHY.p}>Currency, unit display, etc.</Text>
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
