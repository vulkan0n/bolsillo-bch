import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "../styles";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene/common/dist/types";

const ContrastCurrency = ({ navigation }) => {
  const { contrastCurrency } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBitcoinDenomination = () => {
    navigation.navigate("Contrast Currency");
  };

  const uppercaseContrastCurrency = contrastCurrency.toUpperCase();

  const ContrastCurrencyDisplay = (
    <View style={styles.control as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>{uppercaseContrastCurrency}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPressBitcoinDenomination}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && ContrastCurrencyDisplay}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Contrast Currency</Text>
        {contrastCurrency && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display comparison prices in {uppercaseContrastCurrency}.
          </Text>
        )}
      </View>
      {isRightHandedMode && ContrastCurrencyDisplay}
    </Pressable>
  );
};

export default ContrastCurrency;
