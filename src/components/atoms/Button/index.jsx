import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";

const Button = ({
  children,
  variant = "primary",
  isSmall,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles({ variant, isSmall }).button}
    >
      <Text style={styles({ variant, isSmall }).buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
