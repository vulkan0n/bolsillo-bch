import React from "react";
import { TextInput as RNTextInput } from "react-native";
import styles from "./styles";

interface Props {
  text: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  isSmallText?: boolean;
  isMultiline?: boolean;
  numberOfLines?: number;
}

const TextInput = ({
  text = "",
  placeholder = "",
  onChange = () => {},
  isSmallText = false,
  isMultiline = false,
  numberOfLines = 1, // use with isMultiline
}: Props) => {
  const isPlaceholder = text === "";
  const value = isPlaceholder ? placeholder : text;

  return (
    <RNTextInput
      style={styles({ isSmallText, isPlaceholder }).input as any}
      onChangeText={onChange}
      value={value}
      multiline={isMultiline}
      numberOfLines={numberOfLines}
    />
  );
};

export default TextInput;
