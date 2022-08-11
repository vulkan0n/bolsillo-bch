import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";

interface Props {
  onPress?: () => void;
  onChange: () => void;
}

const TextInput = ({ onPress = () => {}, onChange = () => {} }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles({ variant, isSmall }).button as any}
    >
      <Text style={styles({ variant, isSmall }).buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};

export default TextInput;
