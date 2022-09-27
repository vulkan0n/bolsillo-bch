import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import { TYPOGRAPHY } from "@selene/common";
import styles from "../styles";
import { COLOURS } from "@selene/common";
import { toggleIsShowAvailableBalance } from "@redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@types";

const BchDenominated = () => {
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

  const BchDenominatedSwitch = (
    <View style={styles.control as any}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isShowAvailableBalance ? COLOURS.white : COLOURS.bchGreen}
        ios_backgroundColor={COLOURS.white}
        onValueChange={handleToggleIsShowAvailableBalance}
        value={isShowAvailableBalance}
      />
    </View>
  );

  return (
    <Pressable
      onPress={handleToggleIsShowAvailableBalance}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && BchDenominatedSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Show Available Balance</Text>
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
      {isRightHandedMode && BchDenominatedSwitch}
    </Pressable>
  );
};

export default BchDenominated;
