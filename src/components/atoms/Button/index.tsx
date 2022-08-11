import React from "react";
import { Text, Pressable } from "react-native";
import styles from "./styles";

interface Props {
  children: any;
  onPress: () => void;
  variant?: "primary" | "secondary";
  isSmall?: boolean;
  isDisabled?: boolean;
}

const Button = ({
  children,
  onPress = () => {},
  variant = "primary",
  isSmall = false,
  isDisabled = false,
}: Props) => {
  return (
    <Pressable
      onPress={isDisabled ? () => {} : onPress}
      style={styles({ variant, isSmall, isDisabled }).button as any}
    >
      <Text style={styles({ variant, isSmall, isDisabled }).buttonText}>
        {children}
      </Text>
    </Pressable>
  );
};

export default Button;
