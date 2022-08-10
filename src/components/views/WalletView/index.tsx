import React, { useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { connect, useSelector } from "react-redux";
import TransactionPad from "./TransactionPad";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";

function WalletView({ wallet, balance, tempTxId, route, navigation }) {
  const { emit } = route.params;
  const { isTestNet } = useSelector((state) => state.settings);
  const { isCryptoDenominated } = useSelector((state) => state.settings);

  const requestBalance = () =>
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        isTestNet,
      },
    });

  useEffect(() => {
    if (!wallet) {
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: { isTestNet } });
    }
  }, []);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    requestBalance();
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
    requestBalance();
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

      <TransactionPad emit={emit} />
    </View>
  );
}

const mapStateToProps = ({ root: { wallet, balance, tempTxId } }) => ({
  wallet,
  balance,
  tempTxId,
});

export default connect(mapStateToProps)(WalletView);
