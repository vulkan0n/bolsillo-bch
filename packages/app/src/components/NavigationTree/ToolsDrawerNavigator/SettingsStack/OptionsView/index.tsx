import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import styles from "./styles";
import BchDenominated from "./BchDenominated";
import ContrastCurrency from "./ContrastCurrency";
import BitcoinDenomination from "./BitcoinDenomination";
import RightHandedMode from "./RightHandedMode";
import ShowAvailableBalance from "./ShowAvailableBalance";
import ShowCommunityTab from "./ShowCommunityTab";
import TestNet from "./TestNet";
import TYPOGRAPHY from "@selene/common/design/typography";
import Divider from "@selene/app/src/components/atoms/Divider";
import StackSubheader from "@selene/app/src/components/atoms/StackSubheader";

const OptionsView = ({ navigation }) => {
  const onPressReset = () => {
    navigation.navigate("Reset");
  };

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Options"} />
      <ScrollView style={styles.scrollView as any}>
        <View style={styles.container as any}>
          <BchDenominated />
          <BitcoinDenomination navigation={navigation} />
          <ContrastCurrency navigation={navigation} />
          <RightHandedMode />
          <ShowAvailableBalance />
          <ShowCommunityTab />
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
    </View>
  );
};

export default OptionsView;
