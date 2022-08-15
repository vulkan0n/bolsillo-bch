import React, { useEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../../design/typography";
import {
  convertBalanceToDisplay,
  prettifyPadBalance,
} from "../../../../../../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../../../../../types";

const DisplayedBalance = () => {
  const dispatch = useDispatch();
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { error } = useSelector((state: ReduxState) => state.transactionPad);
  const { isBchDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { bitcoinDenomination } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { contrastCurrency } = useSelector(
    (state: ReduxState) => state.settings
  );

  const inputCurrency = isBchDenominated
    ? bitcoinDenomination
    : contrastCurrency;

  const bchBalance = prettifyPadBalance(padBalance, bitcoinDenomination);

  const contrastBalance = prettifyPadBalance(padBalance, contrastCurrency);

  const secondaryBchBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    bitcoinDenomination
  );

  const secondaryContrastBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    contrastCurrency
  );

  const primaryBalance = isBchDenominated ? bchBalance : contrastBalance;
  const secondaryBalance = isBchDenominated
    ? secondaryContrastBalance
    : secondaryBchBalance;

  return (
    <View style={styles.secondaryTitlesWrapper}>
      <Text style={TYPOGRAPHY.h1black as any}>{primaryBalance}</Text>
      <Text style={TYPOGRAPHY.h2black as any}>{secondaryBalance}</Text>
      {!!error && <Text style={styles.padError as any}>{error}</Text>}
    </View>
  );
};

export default DisplayedBalance;
