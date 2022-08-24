import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../design/colours";
import { iconImport, IconType } from "../../../design/icons";

interface Props {
  children: any;
  onPress: () => void;
  variant?: "primary" | "secondary" | "blackOutlined" | "danger";
  size?: "regular" | "small";
  isDisabled?: boolean;
  icon?: IconType;
}

const Button = ({
  children,
  onPress = () => {},
  variant = "primary",
  size = "regular",
  isDisabled = false,
  icon = "",
}: Props) => {
  const isSmall = size === "small";

  const iconColour = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.white;
      case "secondary":
        return COLOURS.bchGreen;
      case "blackOutlined":
        return COLOURS.bchGreen;
      case "danger":
        return COLOURS.errorRed;
      default:
        return COLOURS.bchGreen;
    }
  };

  const buttonStyle = styles({ variant, isSmall, isDisabled });

  return (
    <Pressable
      onPress={isDisabled ? () => {} : onPress}
      style={buttonStyle.button as any}
    >
      {!!icon && (
        <View style={buttonStyle.iconContainer}>
          <FontAwesomeIcon
            icon={iconImport(icon)}
            size={20}
            color={iconColour()}
          />
        </View>
      )}
      <Text style={buttonStyle.buttonText}>{children}</Text>
    </Pressable>
  );
};

export default Button;
