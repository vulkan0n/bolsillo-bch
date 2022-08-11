import React from "react";
import { TextInput as RNTextInput } from "react-native";
import styles from "./styles";

interface Props {
  text: string;
  onChange?: (value: string) => void;
}

const TextInput = ({ text = "", onChange = () => {} }: Props) => {
  return (
    <RNTextInput
      style={styles({}).input as any}
      onChangeText={onChange}
      value={text}
    />
  );
};

export default TextInput;
