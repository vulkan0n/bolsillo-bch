import React from "react";
import { View, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "../styles";
import COLOURS from "../../../../../design/colours";
import { toggleIsShowAvailableBalance } from "../../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../../types";

const CryptoDenominated = () => {
  const dispatch = useDispatch();
  const { isShowAvailableBalance } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsShowAvailableBalance = () => {
    dispatch(toggleIsShowAvailableBalance());
  };

  const CryptoDenominatedSwitch = (
    <View style={styles.control as any}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isShowAvailableBalance ? COLOURS.white : COLOURS.black}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsShowAvailableBalance}
        value={isShowAvailableBalance}
      />
    </View>
  );

  return (
    <View style={styles.optionRow as any}>
      {!isRightHandedMode && CryptoDenominatedSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Crypto Denominated</Text>
        {isShowAvailableBalance && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Show total available balance on Wallet screen.
          </Text>
        )}
        {!isShowAvailableBalance && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Hide total available balance on Wallet screen.
          </Text>
        )}
      </View>
      {isRightHandedMode && CryptoDenominatedSwitch}
    </View>
  );
};

export default CryptoDenominated;
