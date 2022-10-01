import React from "react";
import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY } from "@selene/common";
import { useNavigation } from "@react-navigation/native";
import stylesFunction from "./styles";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene/app/src/types";

interface Props {
  title: string;
  subtitle?: string;
  isBackButton?: boolean;
}

const StackSubheader = ({ title, subtitle, isBackButton = false }: Props) => {
  const navigation = useNavigation();
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBack = () => {
    navigation.goBack();
  };

  const isSubtitle = !!subtitle;

  const styles = stylesFunction({ isSubtitle });

  const BackButton = isBackButton && (
    <Pressable style={styles.pressable as any} onPress={onPressBack}>
      <Text style={TYPOGRAPHY.pGreenUnderlined as any}>{"< "}Back</Text>
    </Pressable>
  );

  return (
    <View style={styles.wrapper as any}>
      <View style={styles.left}>{!isRightHandedMode && BackButton}</View>
      <View>
        <Text style={styles.title as any}>{title}</Text>
        {isSubtitle && <Text style={TYPOGRAPHY.pWhite as any}>{subtitle}</Text>}
      </View>
      <View style={styles.right as any}>{isRightHandedMode && BackButton}</View>
    </View>
  );
};

export default StackSubheader;
