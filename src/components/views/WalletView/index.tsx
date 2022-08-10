import React, { useEffect } from "react";
import { View, Text, Pressable, Image, DeviceEventEmitter } from "react-native";
import { useSelector } from "react-redux";
import TransactionPad from "./TransactionPad";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";
import { EmitEvent, ReduxState } from "../../../types";

function WalletView({ route, navigation }) {
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { tempTxId } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );

  const emit = (event: EmitEvent) =>
    DeviceEventEmitter.emit("event.emitEvent", event);

  useEffect(() => {
    return () => {
      DeviceEventEmitter.removeAllListeners("event.emitEvent");
    };
  }, []);

  const requestBalance = () =>
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        isTestNet,
      },
    });

  // Create a wallet if none exists
  // I.e. first time app is opened
  useEffect(() => {
    if (!wallet?.mnemonic) {
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: { isTestNet } });
    }
  }, []);

  // Refresh wallet when toggling to/from test net
  useEffect(() => {
    console.log("triggering refresh");
    emit({
      type: BRIDGE_MESSAGE_TYPES.REFRESH_WALLET,
      data: { wallet, isTestNet },
    });
  }, [isTestNet]);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    requestBalance();
  }, [wallet, wallet?.mnemonic, wallet?.cashaddr]);

  // Transaction id set to non null means new transaction just completed
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
    <View style={styles.container as any}>
      <Pressable onPress={onPressLogo}>
        <Image
          style={styles.logo}
          source={require("../../../assets/images/logo.jpg")}
        />
      </Pressable>

      <Pressable onPress={onPressBalance} style={styles.widePressable}>
        <View style={styles.primaryTitlesWrapper}>
          <Text style={TYPOGRAPHY.h1 as any}>
            {isCryptoDenominated ? satBalance : usdBalance}
          </Text>
          <Text style={TYPOGRAPHY.h2 as any}>
            {isCryptoDenominated ? usdBalance : satBalance}
          </Text>
        </View>
      </Pressable>

      <TransactionPad emit={emit} />
    </View>
  );
}

export default WalletView;
