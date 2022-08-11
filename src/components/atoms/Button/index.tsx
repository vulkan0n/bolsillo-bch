import React from "react";
import { Text, Pressable } from "react-native";
import styles from "./styles";

interface Props {
  children: any;
  variant?: "primary" | "secondary";
  isSmall?: boolean;
  onPress: () => void;
}

const Button = ({
  children,
  variant = "primary",
  isSmall,
  onPress = () => {},
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles({ variant, isSmall }).button as any}
    >
      <Text style={styles({ variant, isSmall }).buttonText}>{children}</Text>
    </Pressable>
  );
};

export default Button;
