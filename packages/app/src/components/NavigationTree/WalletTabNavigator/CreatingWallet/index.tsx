import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { View, Text } from "react-native";
import styles from "../styles";
import { TYPOGRAPHY } from "@selene/common";
import { selectIsActiveWallet } from "@selene/app/src/redux/selectors";
import { ONE_SECOND } from "@selene/app/src/utils/consts";
import emit from "@selene/app/src/utils/emit";
import { ReduxState } from "@selene/app/src/types";
import { BRIDGE_MESSAGE_TYPES } from "@selene/app/src/utils/bridgeMessages";

const CreatingWallet = () => {
  const isWallet = useSelector((state: ReduxState) =>
    selectIsActiveWallet(state)
  );

  if (isWallet) {
    return;
  }

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const createWallet = () => {
    // Create a wallet if none exists
    // I.e. first time app is opened or after a reset
    emit({
      type: BRIDGE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET,
      data: { isTestNet },
    });
  };

  // Try create a wallet every 3s until it works
  useEffect(() => {
    createWallet();

    const interval = setInterval(() => {
      createWallet();
    }, ONE_SECOND * 3);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.h1 as any}>Creating wallet...</Text>
    </View>
  );
};

export default CreatingWallet;
