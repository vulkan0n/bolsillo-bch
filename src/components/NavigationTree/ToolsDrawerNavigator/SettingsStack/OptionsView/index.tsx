import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import styles from "./styles";
import CryptoDenominated from "./CryptoDenominated";
import BitcoinDenomination from "./BitcoinDenomination";
import RightHandedMode from "./RightHandedMode";
import ShowAvailableBalance from "./ShowAvailableBalance";
import TestNet from "./TestNet";
import TYPOGRAPHY from "../../../../../design/typography";
import Divider from "../../../../atoms/Divider";

const OptionsView = ({ navigation }) => {
  const onPressReset = () => {
    navigation.navigate("Reset");
  };

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <CryptoDenominated />
        <BitcoinDenomination />
        <RightHandedMode />
        <ShowAvailableBalance />
        <TestNet />
        <Divider />
        <Text style={TYPOGRAPHY.pWhite as any}>
          Fiat price data retrieved from CoinGecko.
        </Text>
        <Pressable onPress={onPressReset}>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Reset app</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default OptionsView;
