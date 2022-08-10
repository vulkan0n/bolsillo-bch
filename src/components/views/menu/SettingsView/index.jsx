import React, { useState } from "react";
import { View, Image, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../design/colours";
import { connect } from "react-redux";
import {
  toggleIsCryptoDenominated,
  toggleIsTestNet,
} from "../../../../redux/reducers/settingsReducer";

function SettingsView({ isCryptoDenominated, isTestNet, dispatch }) {
  const handleToggleIsCryptoDenominated = () => {
    dispatch(toggleIsCryptoDenominated());
  };

  const handleToggleIsTestNet = () => {
    dispatch(toggleIsTestNet());
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionRow}>
        <View style={styles.optionText}>
          <Text style={TYPOGRAPHY.h2Left}>Crypto Denominated</Text>
          {isCryptoDenominated && (
            <Text style={TYPOGRAPHY.pWhiteLeft}>
              Display balances in crypto (BCH). Fiat (USD) equivalent displayed
              beneath.
            </Text>
          )}
          {!isCryptoDenominated && (
            <Text style={TYPOGRAPHY.pWhiteLeft}>
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
      <View style={styles.optionRow}>
        <View style={styles.optionText}>
          <Text style={TYPOGRAPHY.h2Left}>Test Net</Text>
          {isTestNet && (
            <Text style={TYPOGRAPHY.pWhiteLeft}>
              Connected to the BCH TestNet.
            </Text>
          )}
          {!isTestNet && (
            <Text style={TYPOGRAPHY.pWhiteLeft}>
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
}

const mapStateToProps = ({ settings: { isCryptoDenominated, isTestNet } }) => ({
  isCryptoDenominated,
  isTestNet,
});

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
