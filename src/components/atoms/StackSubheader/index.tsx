import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "@design/typography";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import { useSelector } from "react-redux";
import { ReduxState } from "@types";

interface Props {
  title: string;
  isBackButton?: boolean;
}

const StackSubheader = ({ title, isBackButton = false }: Props) => {
  const navigation = useNavigation();
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBack = () => {
    navigation.goBack();
  };

  const BackButton = isBackButton && (
    <Pressable style={styles.pressable as any} onPress={onPressBack}>
      <Text style={TYPOGRAPHY.pGreenUnderlined as any}>{"< "}Back</Text>
    </Pressable>
  );

  return (
    <View style={styles.wrapper as any}>
      <View style={styles.left}>{!isRightHandedMode && BackButton}</View>
      <Text style={styles.title as any}>{title}</Text>
      <View style={styles.right as any}>{isRightHandedMode && BackButton}</View>
    </View>
  );
};

export default StackSubheader;
