import React, { useEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../../../../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { updateTransactionPadError } from "../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../redux/rootReducer";

const DisplayedBalance = () => {
  const dispatch = useDispatch();
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { error } = useSelector((state: ReduxState) => state.transactionPad);
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const satBalance = displaySats(padBalance);
  const usdBalance = displaySatsAsUsd(padBalance);

  useEffect(() => {
    setTimeout(() => {
      if (error) {
        dispatch(
          updateTransactionPadError({
            error: "",
          })
        );
      }
    }, 2000);
  }, [error]);

  return (
    <View style={styles.secondaryTitlesWrapper}>
      <Text style={TYPOGRAPHY.h1black as any}>
        {isCryptoDenominated ? satBalance : usdBalance}
      </Text>
      <Text style={TYPOGRAPHY.h2black as any}>
        {isCryptoDenominated ? usdBalance : satBalance}
      </Text>
      {!!error && <Text style={styles.padError as any}>{error}</Text>}
    </View>
  );
};

export default DisplayedBalance;
