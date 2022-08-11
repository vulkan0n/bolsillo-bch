import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import COLOURS from "../../../design/colours";

interface Props {
  children: any;
  onPress: () => void;
  variant?: "primary" | "secondary";
  isSmall?: boolean;
  isDisabled?: boolean;
  icon?: "" | "faPaperPlane";
}

const Button = ({
  children,
  onPress = () => {},
  variant = "primary",
  isSmall = false,
  isDisabled = false,
  icon = "",
}: Props) => {
  const iconColour = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.white;
      case "secondary":
        return COLOURS.bchGreen;
      default:
        return COLOURS.bchGreen;
    }
  };

  const iconImport = () => {
    switch (icon) {
      case "faPaperPlane":
        return faPaperPlane;
      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={isDisabled ? () => {} : onPress}
      style={styles({ variant, isSmall, isDisabled }).button as any}
    >
      {!!icon && (
        <View style={styles({}).iconContainer}>
          <FontAwesomeIcon icon={iconImport()} size={20} color={iconColour()} />
        </View>
      )}
      <Text style={styles({ variant, isSmall, isDisabled }).buttonText}>
        {children}
      </Text>
    </Pressable>
  );
};

export default Button;
