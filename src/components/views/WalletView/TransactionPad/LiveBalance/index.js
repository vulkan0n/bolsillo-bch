import React, { useEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "../../../../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../../../../utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { updateTransactionPadError } from "../../../../../redux/reducers/transactionPadReducer";

const DisplayedBalance = () => {
  const dispatch = useDispatch();
  const { padBalance } = useSelector((state) => state.transactionPad);
  const { error } = useSelector((state) => state.transactionPad);
  const { isCryptoDenominated } = useSelector((state) => state.settings);
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
      <Text style={TYPOGRAPHY.h1black}>
        {isCryptoDenominated ? satBalance : usdBalance}
      </Text>
      <Text style={TYPOGRAPHY.h2black}>
        {isCryptoDenominated ? usdBalance : satBalance}
      </Text>
      {!!error && <Text style={styles.padError}>{error}</Text>}
    </View>
  );
};

export default DisplayedBalance;
