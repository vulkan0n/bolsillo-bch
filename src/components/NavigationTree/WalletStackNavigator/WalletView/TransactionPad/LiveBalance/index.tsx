import React from "react";
import { Pressable, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../../design/typography";
import {
  convertBalanceToDisplay,
  prettifyPadBalance,
} from "../../../../../../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../../../../../types";
import { toggleIsBchDenominated } from "../../../../../../redux/reducers/settingsReducer";
import { clearTransactionPad } from "../../../../../../redux/reducers/transactionPadReducer";

const DisplayedBalance = () => {
  const dispatch = useDispatch();
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { error } = useSelector((state: ReduxState) => state.transactionPad);
  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    useSelector((state: ReduxState) => state.settings);
  const inputCurrency = isBchDenominated
    ? bitcoinDenomination
    : contrastCurrency;

  const primaryBalance = prettifyPadBalance(
    padBalance,
    isBchDenominated ? bitcoinDenomination : contrastCurrency
  );
  const secondaryBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    isBchDenominated ? contrastCurrency : bitcoinDenomination
  );

  const onPressSwapDenomination = () => {
    dispatch(clearTransactionPad());
    dispatch(toggleIsBchDenominated());
  };

  return (
    <Pressable
      onPress={onPressSwapDenomination}
      style={styles.secondaryTitlesWrapper}
    >
      <Text style={TYPOGRAPHY.h1black as any}>{primaryBalance}</Text>
      <Text style={TYPOGRAPHY.h2black as any}>{secondaryBalance}</Text>
      {!!error && <Text style={styles.padError as any}>{error}</Text>}
    </Pressable>
  );
};

export default DisplayedBalance;
