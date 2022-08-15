import React, { useEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../../design/typography";
import {
  padBalanceToBchDisplay,
  displaySatsAsUsd,
} from "../../../../../../utils/formatting";
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

  const bchBalance = "XX"; // padBalanceToBchDisplay(padBalance, bitcoinDenomination);

  const usdBalance = displaySatsAsUsd(padBalance);

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
        {isBchDenominated ? bchBalance : usdBalance}
      </Text>
      <Text style={TYPOGRAPHY.h2black as any}>
        {isBchDenominated ? usdBalance : bchBalance}
      </Text>
      {!!error && <Text style={styles.padError as any}>{error}</Text>}
    </View>
  );
};

export default DisplayedBalance;
