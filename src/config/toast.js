import React from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../design/typography";
import COLOURS from "../design/colours";
import SPACING from "../design/spacing";

const toastConfig = {
  customError: ({ props: { title, text }, ...props }) => (
    <View
      style={{
        backgroundColor: COLOURS.black,
        margin: SPACING.fifteen,
        padding: SPACING.fifteen,
        borderRadius: SPACING.borderRadius,
        borderLeftWidth: SPACING.five,
        borderLeftColor: COLOURS.errorRed,
        borderRightWidth: 1,
        borderRightColor: COLOURS.white,
        borderTopWidth: 1,
        borderTopColor: COLOURS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLOURS.white,
      }}
    >
      <Text style={TYPOGRAPHY.h2}>{title}</Text>
      <Text style={TYPOGRAPHY.pWhite}>{text}</Text>
    </View>
  ),
};

export default toastConfig;
