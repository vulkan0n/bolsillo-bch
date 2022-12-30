import React from "react";
import { View, Text, Pressable } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport, IconType } from "@selene-wallet/app/src/design/icons";
import COLOURS from "@selene-wallet/common/design/colours";
import styles from "./styles";

interface Props {
  text: string;
  leftIcon?: IconType;
  rightIcon?: IconType;
}

const GreyBar = ({ text, leftIcon, rightIcon }: Props) => {
  return (
    <View style={styles.container as any}>
      {leftIcon && (
        <FontAwesomeIcon
          icon={iconImport(leftIcon)}
          size={20}
          color={COLOURS.black}
        />
      )}

      <Text style={styles.text as any}>{text}</Text>

      {rightIcon && (
        <FontAwesomeIcon
          icon={iconImport(rightIcon)}
          size={20}
          color={COLOURS.black}
        />
      )}
    </View>
  );
};

export default GreyBar;
