import React from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "../../../../../../design/typography";
import styles from "../styles";
import { toggleIsCryptoDenominated } from "../../../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../../../types";

const CryptoDenominated = () => {
  const dispatch = useDispatch();
  const { bitcoinDenomination } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBitcoinDenomination = () => {
    dispatch(toggleIsCryptoDenominated());
  };

  const BitcoinDenominationIndicator = (
    <Pressable
      onPress={onPressBitcoinDenomination}
      style={styles.control as any}
    >
      <Text>{bitcoinDenomination}</Text>
    </Pressable>
  );

  return (
    <View style={styles.optionRow as any}>
      {!isRightHandedMode && BitcoinDenominationIndicator}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Crypto Denominated</Text>
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

export default CryptoDenominated;
