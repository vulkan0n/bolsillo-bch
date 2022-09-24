import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "@design/typography";
import Button from "@atoms/Button";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@design/colours";
import { MotiView } from "moti";
import { iconImport } from "@design/icons";
import { updateLocalLastSentTransactionHash } from "@redux/reducers/localReducer";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@types";
import NumPad from "@atoms/NumPad";

function NumPadModal({ navigation }) {
  const dispatch = useDispatch();

  const onPressOk = () => {
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
        <View style={styles.iconWrapper as any}>
          <FontAwesomeIcon
            icon={iconImport("faCircleCheck")}
            size={120}
            color={COLOURS.white}
          />
        </View>
        <Text style={TYPOGRAPHY.h1 as any}>NumPadModal</Text>
        <NumPad />
        <View style={styles.objectWrapper as any}>
          <Button
            icon={"faCircleCheck"}
            onPress={onPressOk}
            variant={"primary"}
          >
            Ok
          </Button>
        </View>
      </MotiView>
    </Pressable>
  );
}

export default NumPadModal;
