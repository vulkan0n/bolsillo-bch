import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons/faBookOpenReader";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";
import COLOURS from "../../../design/colours";
import TYPOGRAPHY from "../../../design/typography";

interface Props {
  onPress: () => void;
  title: string;
  text: string;
  icon?: any;
}

const PressableCard = ({
  onPress = () => {},
  title = "",
  text = "",
  icon = "",
}: Props) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.pressableCard as any}>
        <View style={styles.iconWrapper as any}>
          <FontAwesomeIcon icon={icon} size={45} color={COLOURS.bchGreen} />
        </View>
        <Text style={TYPOGRAPHY.menuHeaderGreen as any}>{title}</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>{text}</Text>
      </View>
    </Pressable>
  );
};

export default PressableCard;
