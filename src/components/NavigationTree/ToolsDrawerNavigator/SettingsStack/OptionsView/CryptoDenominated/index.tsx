import React from "react";
import { View, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../../../design/typography";
import styles from "../styles";
import COLOURS from "../../../../../../design/colours";
import { toggleIsCryptoDenominated } from "../../../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../../../types";

const CryptoDenominated = () => {
  const dispatch = useDispatch();
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsCryptoDenominated = () => {
    dispatch(toggleIsCryptoDenominated());
  };

  const CryptoDenominatedSwitch = (
    <View style={styles.control as any}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isCryptoDenominated ? COLOURS.white : COLOURS.black}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsCryptoDenominated}
        value={isCryptoDenominated}
      />
    </View>
  );

  return (
    <View style={styles.optionRow as any}>
      {!isRightHandedMode && CryptoDenominatedSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Crypto Denominated</Text>
        {isCryptoDenominated && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display balances in crypto (BCH). Fiat (USD) equivalent displayed
            beneath.
          </Text>
        )}
        {!isCryptoDenominated && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Display balances in fiat (USD). Crypto (BCH) equivalent displayed
            beneath.
          </Text>
        )}
      </View>
      {isRightHandedMode && CryptoDenominatedSwitch}
    </View>
  );
};

export default CryptoDenominated;
