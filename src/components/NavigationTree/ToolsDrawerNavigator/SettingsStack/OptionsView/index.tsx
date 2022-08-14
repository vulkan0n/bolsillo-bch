import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import styles from "./styles";
import CryptoDenominated from "./CryptoDenominated";
import TestNet from "./TestNet";
import RightHandedMode from "./RightHandedMode";
import ShowAvailableBalance from "./ShowAvailableBalance";
import TYPOGRAPHY from "../../../../../design/typography";

const OptionsView = ({ navigation }) => {
  const onPressReset = () => {
    navigation.navigate("Reset");
  };

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <CryptoDenominated />
        <RightHandedMode />
        <ShowAvailableBalance />
        <TestNet />
        <Pressable onPress={onPressReset}>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Reset wallet</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default OptionsView;
