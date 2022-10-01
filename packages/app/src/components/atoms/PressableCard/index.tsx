import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@selene/common/design/colours";
import TYPOGRAPHY from "@selene/common/design/typography";
import { iconImport, IconType } from "@selene/app/src/design/icons";

interface Props {
  onPress: () => void;
  title: string;
  text: string;
  icon?: IconType;
  variant?: "wide";
}

const PressableCard = ({
  onPress = () => {},
  title = "",
  text = "",
  icon = "",
  variant = "",
}: Props) => {
  const cardStyles = styles({ variant });

  return (
    <Pressable onPress={onPress}>
      <View style={cardStyles.pressableCard as any}>
        <View style={cardStyles.iconWrapper as any}>
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
