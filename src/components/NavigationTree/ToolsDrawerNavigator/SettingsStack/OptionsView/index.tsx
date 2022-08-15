import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import styles from "./styles";
import BchDenominated from "./BchDenominated";
import ContrastCurrency from "./ContrastCurrency";
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
        <BchDenominated />
        <ContrastCurrency navigation={navigation} />
        <BitcoinDenomination navigation={navigation} />
        <RightHandedMode />
        <ShowAvailableBalance />
        <TestNet />
        <Divider />
        <Text style={TYPOGRAPHY.pWhite as any}>
          Price data retrieved from CoinGecko.
        </Text>
        <Pressable onPress={onPressReset}>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Reset app</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default OptionsView;
