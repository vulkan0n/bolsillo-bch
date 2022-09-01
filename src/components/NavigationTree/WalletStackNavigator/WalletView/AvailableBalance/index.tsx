import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import { selectActiveWalletBalance } from "@redux/selectors";
import { ReduxState } from "@types";

function AvailableBalance() {
  const { primaryBalance, secondaryBalance } = useSelector(
    (state: ReduxState) => selectActiveWalletBalance(state)
  );

  return (
    <View>
      <Text style={TYPOGRAPHY.pWhite as any}>Available Balance</Text>
      <View style={styles.primaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1 as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.h2 as any}>{secondaryBalance}</Text>
      </View>
    </View>
  );
}

export default AvailableBalance;
