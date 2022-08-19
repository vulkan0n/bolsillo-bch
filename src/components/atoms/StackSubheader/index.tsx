import React from "react";
import { View, Text, Pressable } from "react-native";
import COLOURS from "../../../design/colours";
import SPACING from "../../../design/spacing";
import TYPOGRAPHY from "../../../design/typography";
import { useNavigation } from "@react-navigation/native";

interface Props {
  title: string;
  isBackButton: boolean;
}

const StackSubheader = ({ title, isBackButton = false }: Props) => {
  const navigation = useNavigation();

  const onPressBack = () => {
    navigation.goBack();
  };

  return (
    <View
      style={{
        width: "100%",
        height: 40,
        backgroundColor: COLOURS.black,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isBackButton && (
        <Pressable onPress={onPressBack}>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Back</Text>
        </Pressable>
      )}
      <Text
        style={
          {
            ...TYPOGRAPHY.h2,
            marginBottom: 0,
            marginTop: SPACING.five,
          } as any
        }
      >
        {title}
      </Text>
    </View>
  );
};

export default StackSubheader;
