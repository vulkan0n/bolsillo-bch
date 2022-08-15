import React, { useEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../../design/typography";
import { convertBalanceToDisplay } from "../../../../../../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { updateTransactionPadError } from "../../../../../../redux/reducers/transactionPadReducer";
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

  const bchBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    bitcoinDenomination
  );

  const contrastBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    contrastCurrency
  );

  useEffect(() => {
    dispatch(
      updateTransactionPadError({
        error: "",
      })
    );
  }, [padBalance]);

  return (
    <View style={styles.secondaryTitlesWrapper}>
      <Text style={TYPOGRAPHY.h1black as any}>
        {isBchDenominated ? bchBalance : contrastBalance}
      </Text>
      <Text style={TYPOGRAPHY.h2black as any}>
        {isBchDenominated ? contrastBalance : bchBalance}
      </Text>
      {!!error && <Text style={styles.padError as any}>{error}</Text>}
    </View>
  );
};

export default DisplayedBalance;
