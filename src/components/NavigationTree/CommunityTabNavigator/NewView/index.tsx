import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";

function NewView({ navigation }) {
  const proposals = [];

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}></View>
    </ScrollView>
  );
}

export default NewView;
