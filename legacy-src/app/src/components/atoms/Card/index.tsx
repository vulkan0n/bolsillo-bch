import React from "react";
import { View } from "react-native";
import styles from "./styles";

interface Props {
  isInteractive?: boolean;
  children: any;
}

function Card({ isInteractive = true, children }: Props) {
  return (
    <View
      style={styles.contentContainer}
      pointerEvents={isInteractive ? "auto" : "none"}
    >
      {children}
    </View>
  );
}

export default Card;
