import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "../styles";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@selene/common/dist/types";

const BitcoinDenomination = ({ navigation }) => {
  const { bitcoinDenomination } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBitcoinDenomination = () => {
    navigation.navigate("Denomination");
  };

  const BitcoinDenominationIndicator = (
    <View style={styles.control as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>{bitcoinDenomination}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPressBitcoinDenomination}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && BitcoinDenominationIndicator}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>BCH Denomination</Text>
        {bitcoinDenomination && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display BCH amounts in {bitcoinDenomination}.
          </Text>
        )}
      </View>
      {isRightHandedMode && BitcoinDenominationIndicator}
    </Pressable>
  );
};

export default BitcoinDenomination;
