import React from "react";
import { Pressable, View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import {
  selectActiveWallet,
  selectActiveWalletBalance,
  selectPrimaryCurrencyOrDenomination,
} from "@redux/selectors";
import {} from "@redux/selectors";
import {
  convertRawSatsToRawCurrency,
  convertRawSatsToRawCurrencyRounded,
} from "@utils/formatting";
import { updateTransactionPadBalance } from "@redux/reducers/transactionPadReducer";

function AvailableBalance() {
  const dispatch = useDispatch();
  const { primaryBalance, secondaryBalance } = useSelector(
    (state: ReduxState) => selectActiveWalletBalance(state)
  );
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  selectPrimaryCurrencyOrDenomination;

  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressMax = () => {
    const availableSats = wallet.balance.toString();
    const newPadBalance = convertRawSatsToRawCurrencyRounded(
      availableSats,
      primaryCurrency
    );
    dispatch(
      updateTransactionPadBalance({
        padBalance: newPadBalance,
      })
    );
  };

  const EmptyBlock = <View style={styles.sideBlock as any}></View>;

  const MaxBlock = (
    <View style={styles.sideBlock as any}>
      <Pressable onPress={onPressMax}>
        <Text style={TYPOGRAPHY.h2Green}>MAX</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container as any}>
      {isRightHandedMode ? EmptyBlock : MaxBlock}
      <View style={styles.centalContainer as any}>
        <Text style={TYPOGRAPHY.pWhite as any}>Available Balance</Text>
        <View style={styles.primaryTitlesWrapper}>
          <Text style={TYPOGRAPHY.h1 as any}>{primaryBalance}</Text>
          <Text style={TYPOGRAPHY.h2 as any}>{secondaryBalance}</Text>
        </View>
      </View>
      {isRightHandedMode ? MaxBlock : EmptyBlock}
    </View>
  );
}

export default AvailableBalance;
