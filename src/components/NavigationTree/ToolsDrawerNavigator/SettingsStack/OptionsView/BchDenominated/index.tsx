import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import TYPOGRAPHY from "@design/typography";
import styles from "../styles";
import COLOURS from "@design/colours";
import { toggleIsBchDenominated } from "@redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@types";

const BchDenominated = () => {
  const dispatch = useDispatch();
  const { isBchDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { contrastCurrency } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsBchDenominated = () => {
    dispatch(toggleIsBchDenominated());
  };

  const BchDenominatedSwitch = (
    <View style={styles.control as any}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isBchDenominated ? COLOURS.white : COLOURS.bchGreen}
        ios_backgroundColor={COLOURS.white}
        onValueChange={handleToggleIsBchDenominated}
        value={isBchDenominated}
      />
    </View>
  );

  const uppercaseContrastCurrency = contrastCurrency.toUpperCase();

  return (
    <Pressable
      onPress={handleToggleIsBchDenominated}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && BchDenominatedSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>BCH Denominated</Text>
        {isBchDenominated && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display balances in BCH. Contrast currency equivalent (
            {uppercaseContrastCurrency}) displayed beneath.
          </Text>
        )}
        {!isBchDenominated && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display balances in contrast currency ({uppercaseContrastCurrency}).
            BCH equivalent displayed beneath.
          </Text>
        )}
      </View>
      {isRightHandedMode && BchDenominatedSwitch}
    </Pressable>
  );
};

export default BchDenominated;
