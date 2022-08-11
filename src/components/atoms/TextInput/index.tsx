import React from "react";
import { TextInput as RNTextInput } from "react-native";
import styles from "./styles";

interface Props {
  text: string;
  onChange?: (value: string) => void;
  isSmallText?: boolean;
}

const TextInput = ({
  text = "",
  onChange = () => {},
  isSmallText = false,
}: Props) => {
  return (
    <RNTextInput
      style={styles({ isSmallText }).input as any}
      onChangeText={onChange}
      value={text}
    />
  );
};

export default TextInput;
