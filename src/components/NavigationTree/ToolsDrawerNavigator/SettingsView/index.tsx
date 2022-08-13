import React from "react";
import { View, Image, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../design/colours";
import {
  toggleIsCryptoDenominated,
  toggleIsRightHandedMode,
  toggleIsTestNet,
} from "../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../types";

const SettingsView = () => {
  const dispatch = useDispatch();
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const handleToggleIsCryptoDenominated = () => {
    dispatch(toggleIsCryptoDenominated());
  };

  const handleToggleIsRightHandedMode = () => {
    dispatch(toggleIsRightHandedMode());
  };

  const handleToggleIsTestNet = () => {
    dispatch(toggleIsTestNet());
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

  const RightHandedModeSwitch = (
    <View style={styles.control}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isRightHandedMode ? COLOURS.white : COLOURS.black}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsRightHandedMode}
        value={isRightHandedMode}
      />
    </View>
  );

  const TestNetSwitch = (
    <View style={styles.control}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isTestNet ? COLOURS.white : COLOURS.black}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsTestNet}
        value={isTestNet}
      />
    </View>
  );

  return (
    <View style={styles.container as any}>
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

      <View style={styles.optionRow as any}>
        {!isRightHandedMode && RightHandedModeSwitch}
        <View style={{ width: 250 }}>
          <Text style={TYPOGRAPHY.h2Left as any}>Right Handed Mode</Text>
          {isRightHandedMode && (
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              Interactive components tend to appear on right of screen for easy
              thumb access. Change if left-hand dominated.
            </Text>
          )}
          {!isRightHandedMode && (
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              Interactive components tend to appear on left of screen for easy
              thumb access. Change if right-hand dominated.
            </Text>
          )}
        </View>
        {isRightHandedMode && RightHandedModeSwitch}
      </View>

      <View style={styles.optionRow as any}>
        {!isRightHandedMode && TestNetSwitch}
        <View style={{ width: 250 }}>
          <Text style={TYPOGRAPHY.h2Left as any}>Test Net</Text>
          {isTestNet && (
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              Connected to the BCH TestNet.
            </Text>
          )}
          {!isTestNet && (
            <Text style={TYPOGRAPHY.pWhiteLeft as any}>
              Currently connected to BCH main network. If you don't know about
              TestNet, don't change this.
            </Text>
          )}
        </View>
        {isRightHandedMode && TestNetSwitch}
      </View>
    </View>
  );
};

export default SettingsView;
