import React from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../design/typography";
import COLOURS from "../design/colours";
import SPACING from "../design/spacing";

const toastConfig = {
  customError: ({ props: { title, text }, ...props }) => (
    <View
      style={{
        backgroundColor: COLOURS.white,
        margin: SPACING.fifteen,
        padding: SPACING.fifteen,
        borderRadius: SPACING.borderRadius,
        borderLeftWidth: SPACING.five,
        borderLeftColor: COLOURS.errorRed,
      }}
    >
      <Text style={TYPOGRAPHY.h2black}>{title}</Text>
      <Text style={TYPOGRAPHY.p}>{text}</Text>
    </View>
  ),
};

export default toastConfig;
