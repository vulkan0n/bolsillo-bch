import React, { useEffect } from "react";
import { View, Image, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TransactionPad from "./TransactionPad";
import styles from "./styles";
import { ReduxState } from "@types";
import TYPOGRAPHY from "@design/typography";
import AvailableBalance from "./AvailableBalance";
import { updateTransactionPadBalance } from "../../../../redux/reducers/transactionPadReducer";

function SendView({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(
        updateTransactionPadBalance({
          padBalance: "0",
        })
      );
    });

    return unsubscribe;
  }, [navigation]);

  const isNoWallet = useSelector(
    (state: ReduxState) => state.walletManager?.wallets?.length === 0
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
      <TransactionPad navigation={navigation} />
    </View>
  );
}

export default SendView;
