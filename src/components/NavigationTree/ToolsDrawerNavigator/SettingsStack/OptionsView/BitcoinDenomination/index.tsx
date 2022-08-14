import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "../../../../../../design/typography";
import styles from "../styles";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../../../types";

const BitcoinDenominated = ({ navigation }) => {
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
    <Pressable
      onPress={onPressBitcoinDenomination}
      style={styles.control as any}
    >
      <Text style={TYPOGRAPHY.pWhite as any}>{bitcoinDenomination}</Text>
    </Pressable>
  );

  return (
    <View style={styles.optionRow as any}>
      {!isRightHandedMode && BitcoinDenominationIndicator}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Bitcoin Denomination</Text>
        {bitcoinDenomination && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display BCH amounts in {bitcoinDenomination}.
          </Text>
        )}
      </View>
      {isRightHandedMode && BitcoinDenominationIndicator}
    </View>
  );
};

export default BitcoinDenominated;
