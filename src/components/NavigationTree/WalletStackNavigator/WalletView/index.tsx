import React, { useEffect } from "react";
import { View, Image, Text } from "react-native";
import { useSelector } from "react-redux";
import TransactionPad from "./TransactionPad";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ReduxState } from "@types";
import emit from "@utils/emit";
import AvailableBalance from "./AvailableBalance";
import TYPOGRAPHY from "@design/typography";
import { ONE_SECOND } from "@utils/consts";

function WalletView({ navigation }) {
  const isNoWallet = useSelector(
    (state: ReduxState) => state.walletManager?.wallets?.length === 0
  );
  const { isShowAvailableBalance } = useSelector(
    (state: ReduxState) => state.settings
  );

  if (isNoWallet) {
    return (
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1 as any}>Creating wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container as any}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />

      {isShowAvailableBalance && <AvailableBalance />}
      <TransactionPad navigation={navigation} />
    </View>
  );
}

export default WalletView;
