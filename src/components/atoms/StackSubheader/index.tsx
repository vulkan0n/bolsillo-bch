import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";

interface Props {
  title: string;
  isBackButton?: boolean;
}

const StackSubheader = ({ title, isBackButton = false }: Props) => {
  const navigation = useNavigation();

  const onPressBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.wrapper as any}>
      <View style={styles.left}>
        {isBackButton && (
          <Pressable style={styles.pressable as any} onPress={onPressBack}>
            <Text style={TYPOGRAPHY.pGreenUnderlined as any}>{"< "}Back</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.title as any}>{title}</Text>
      <View style={styles.right as any}></View>
    </View>
  );
};

export default StackSubheader;
