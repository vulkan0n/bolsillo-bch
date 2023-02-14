import React from "react";
import { TextInput as RNTextInput } from "react-native";
import styles from "./styles";

interface Props {
  numberAsString: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const IntegerInput = ({ numberAsString = "", onChange = () => {} }: Props) => {
  return (
    <RNTextInput
      style={styles({}).input as any}
      onChangeText={onChange}
      value={numberAsString}
      keyboardType="decimal-pad"
      placeholder="0"
    />
  );
};

export default IntegerInput;
