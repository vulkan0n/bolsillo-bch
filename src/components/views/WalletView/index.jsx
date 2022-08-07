import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { connect } from "react-redux";
import NumPad from "../../NumPad";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";

function WalletView({
  wallet,
  balance,
  tempTxId,
  isCryptoDenominated,
  route,
  navigation,
}) {
  const { emit } = route.params;

  useEffect(() => {
    if (!wallet) {
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: null });
    }
  }, []);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    emit({ type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE, data: null });
  }, [wallet]);

  useEffect(() => {
    if (!tempTxId) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Transaction Success" }],
    });
  }, [tempTxId]);

  const onPressLogo = () => {
    navigation.navigate("Menu");
  };

  const onPressBalance = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
      },
    });
  };

  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

  return (
    <View style={styles.container}>
      <Pressable onPress={onPressLogo}>
        <Image
          style={styles.logo}
          source={require("../../../assets/images/logo.jpg")}
        />
      </Pressable>

      <Pressable onPress={onPressBalance} style={styles.widePressable}>
        <View style={styles.primaryTitlesWrapper}>
          <Text style={TYPOGRAPHY.h1}>
            {isCryptoDenominated ? satBalance : usdBalance}
          </Text>
          <Text style={TYPOGRAPHY.h2}>
            {isCryptoDenominated ? usdBalance : satBalance}
          </Text>
        </View>
      </Pressable>

      <NumPad emit={emit} />
    </View>
  );
}

const mapStateToProps = ({
  wallet,
  balance,
  tempTxId,
  isCryptoDenominated,
}) => ({
  wallet,
  balance,
  tempTxId,
  isCryptoDenominated,
});

export default connect(mapStateToProps)(WalletView);
