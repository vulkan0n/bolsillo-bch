import React from "react";
import { View, Image, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../design/colours";
import {
  toggleIsCryptoDenominated,
  toggleIsTestNet,
} from "../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";

const SettingsView = () => {
  const dispatch = useDispatch();
  const { isCryptoDenominated } = useSelector((state) => state.settings);
  const { isTestNet } = useSelector((state) => state.settings);

  const handleToggleIsCryptoDenominated = () => {
    dispatch(toggleIsCryptoDenominated());
  };

  const handleToggleIsTestNet = () => {
    dispatch(toggleIsTestNet());
  };

  return (
    <View style={styles.container as any}>
      <View style={styles.optionRow as any}>
        <View>
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
        <View style={styles.control}>
          <Switch
            trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
            thumbColor={isCryptoDenominated ? COLOURS.white : COLOURS.black}
            ios_backgroundColor={COLOURS.lightGrey}
            onValueChange={handleToggleIsCryptoDenominated}
            value={isCryptoDenominated}
          />
        </View>
      </View>
      <View style={styles.optionRow as any}>
        <View>
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
        <View style={styles.control}>
          <Switch
            trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
            thumbColor={isTestNet ? COLOURS.white : COLOURS.black}
            ios_backgroundColor={COLOURS.lightGrey}
            onValueChange={handleToggleIsTestNet}
            value={isTestNet}
          />
        </View>
      </View>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
    </View>
  );
};

export default SettingsView;
