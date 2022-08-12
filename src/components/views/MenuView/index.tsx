import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons/faBookOpenReader";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";
import COLOURS from "../../../design/colours";
import PressableCard from "../../atoms/PressableCard";

function MenuView({ navigation }) {
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
      <View style={styles.menuContainer as any}>
        <View style={styles.menuRow as any}>
          <Pressable onPress={onPressCommunity}>
            <View style={styles.pressableCardWide}>
              <View style={styles.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={faUsers}
                  size={45}
                  color={COLOURS.bchGreen}
                />
              </View>
              <Text style={TYPOGRAPHY.menuHeaderGreen as any}>
                BCH Community
              </Text>
              <Text style={TYPOGRAPHY.pWhite as any}>
                Discussion, social media, art, music, podcasts, memes and more.
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.menuRow as any}>
          <PressableCard
            title={"Learn"}
            text={"Understand Bitcoin Cash"}
            onPress={onPressLearn}
            icon={faBookOpenReader}
          />
          <PressableCard
            title={"Backup"}
            text={"Keep your money safe!"}
            onPress={onPressBackup}
            icon={faPiggyBank}
          />
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
                Credit, code & donations.
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
              <Text style={TYPOGRAPHY.pWhite as any}>Customise your app.</Text>
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
