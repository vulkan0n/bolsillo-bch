import React, { useState } from "react";
import { View, Image, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../design/colours";
import { connect } from "react-redux";
import ACTION_TYPES from "../../../../redux/actionTypes";

function SettingsView({ isCryptoDenominated, dispatch }) {
  const toggleIsCryptoDenominated = () => {
    dispatch({
      type: ACTION_TYPES.TOGGLE_IS_CRYPTO_DENOMINATED,
    });
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
            onValueChange={toggleIsCryptoDenominated}
            value={isCryptoDenominated}
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

const mapStateToProps = ({ isCryptoDenominated }) => ({ isCryptoDenominated });

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
