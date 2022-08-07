import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../../atoms/Button";
import TYPOGRAPHY from "../../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";
import Toast from "react-native-toast-message";
import ACTION_TYPES from "../../../redux/actionTypes";

const DisplayedBalance = ({
  balance,
  transactionPadBalance,
  isCryptoDenominated,
  dispatch,
}) => {
  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

  const onPressShare = () => {
    Toast.show({
      type: "customError",
      props: {
        title: "TODO",
        text: "Implement share feature",
      },
    });
  };

  const onPressBack = () => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_STATE,
      payload: {
        transactionPadState: "",
      },
    });
  };

  return (
    <View style={styles.inputBackground}>
      <View style={styles.secondaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1black}>
          {displaySats(transactionPadBalance)}
          {/* {isCryptoDenominated ? satBalance : usdBalance} */}
        </Text>
        <Text style={TYPOGRAPHY.h2black}>
          {" "}
          {isCryptoDenominated ? usdBalance : satBalance}
        </Text>
      </View>
      <View style={styles.receivePad}></View>
      <View style={styles.buttonContainer}>
        <Button onPress={onPressShare} isSmall>
          Share
        </Button>
        <Button variant="secondary" onPress={onPressBack} isSmall>
          Back
        </Button>
      </View>
    </View>
  );
};

const mapStateToProps = ({
  wallet,
  balance,
  transactionPadBalance,
  isCryptoDenominated,
}) => ({
  wallet,
  balance,
  transactionPadBalance,
  isCryptoDenominated,
});

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(ReceivePad);
