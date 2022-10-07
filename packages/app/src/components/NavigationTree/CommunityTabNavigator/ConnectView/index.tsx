import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";

function ConnectView({ navigation }) {
  const proposals = [];

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.ten } as any}>
          Find
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Get all the latest from the BCH community.
        </Text>
      </View>
    </ScrollView>
  );
}

export default ConnectView;
