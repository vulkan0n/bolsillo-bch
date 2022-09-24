import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Button from "@atoms/Button";
import styles from "./styles";
import { MotiView } from "moti";
import { useDispatch } from "react-redux";
import NumPad from "@atoms/NumPad";
import LiveBalance from "../../../atoms/LiveBalance";

function NumPadModal({ navigation }) {
  const dispatch = useDispatch();

  const onPressOk = () => {
    navigation.navigate("Tab Navigator");
  };

  const onPressBack = () => {
    navigation.navigate("Tab Navigator");
  };

  return (
    <Pressable onPress={onPressOk} style={styles.container as any}>
      <MotiView
        from={{ opacity: 0, translateY: 35 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1200 }}
        style={styles.motiView as any}
      >
        <LiveBalance />
        <NumPad isCheckInsufficientBalance />
        <Button icon={"faCircleCheck"} onPress={onPressOk} variant={"primary"}>
          Ok
        </Button>
        <Button icon={"faXmark"} onPress={onPressOk} variant={"secondary"}>
          Cancel
        </Button>
      </MotiView>
    </Pressable>
  );
}

export default NumPadModal;
