import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../design/colours";
import TYPOGRAPHY from "../../../design/typography";
import { iconImport } from "../../../design/icons";

interface Props {
  onPress: () => void;
  title: string;
  text: string;
  icon?: string;
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
          <FontAwesomeIcon
            icon={iconImport(icon)}
            size={45}
            color={COLOURS.bchGreen}
          />
        </View>
        <Text style={TYPOGRAPHY.menuHeaderGreen as any}>{title}</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>{text}</Text>
      </View>
    </Pressable>
  );
};

export default PressableCard;
