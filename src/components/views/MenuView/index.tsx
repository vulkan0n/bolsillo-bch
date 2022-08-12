import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
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
            icon={"faBookOpenReader"}
          />
          <PressableCard
            title={"Backup"}
            text={"Keep your money safe!"}
            onPress={onPressBackup}
            icon={"faPiggyBank"}
          />
        </View>
        <View style={styles.menuRow as any}>
          <PressableCard
            title={"Devs"}
            text={"Credit, code & donations."}
            onPress={onPressDevs}
            icon={"faCode"}
          />
          <PressableCard
            title={"Settings"}
            text={"Customise your app."}
            onPress={onPressSettings}
            icon={"faGears"}
          />
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
