import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import TYPOGRAPHY from "../../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";
import ACTION_TYPES from "../../../redux/actionTypes";

const DisplayedBalance = ({
  balance,
  transactionPadBalance,
  transactionPadError,
  isCryptoDenominated,
  dispatch,
}) => {
  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

  useEffect(() => {
    setTimeout(() => {
      if (transactionPadError) {
        dispatch({
          type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_ERROR,
          payload: {
            transactionPadError: "",
          },
        });
      }
    }, 2000);
  }, [transactionPadError]);

  return (
    <View style={styles.secondaryTitlesWrapper}>
      <Text style={TYPOGRAPHY.h1black}>
        {displaySats(transactionPadBalance)}
        {/* {isCryptoDenominated ? satBalance : usdBalance} */}
      </Text>
      <Text style={TYPOGRAPHY.h2black}>
        {" "}
        {isCryptoDenominated ? usdBalance : satBalance}
      </Text>
      {!!inputError && <Text style={styles.inputError}>{inputError}</Text>}
    </View>
  );
};

const mapStateToProps = ({
  balance,
  transactionPadBalance,
  isCryptoDenominated,
}) => ({
  balance,
  transactionPadBalance,
  isCryptoDenominated,
});

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(DisplayedBalance);
