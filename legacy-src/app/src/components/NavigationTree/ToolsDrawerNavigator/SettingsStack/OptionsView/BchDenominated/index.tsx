import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "../styles";
import COLOURS from "@selene-wallet/common/design/colours";
import { toggleIsBchDenominated } from "@selene-wallet/app/src/redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";

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
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.lightGrey }}
        thumbColor={COLOURS.white}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsBchDenominated}
        value={isBchDenominated}
        style={{
          borderColor: COLOURS.bchGreen,
          borderWidth: 2,
        }}
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
          <>
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              Display balances in contrast currency ({uppercaseContrastCurrency}
              ). BCH equivalent displayed beneath.
            </Text>
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              NOTE: Send "MAX" will only manage the closest approximate. To send
              every satoshi, switch back to BCH denomination.
            </Text>
          </>
        )}
      </View>
      {isRightHandedMode && BchDenominatedSwitch}
    </Pressable>
  );
};

export default BchDenominated;
