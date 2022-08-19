import React from "react";
import { View, Text } from "react-native";
import COLOURS from "../../../design/colours";
import SPACING from "../../../design/spacing";
import TYPOGRAPHY from "../../../design/typography";

interface Props {
  title: string;
}

const StackSubheader = ({ title }: Props) => {
  return (
    <View
      style={{
        width: "100%",
        height: 40,
        backgroundColor: COLOURS.black,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
