import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../../atoms/Button";
import TYPOGRAPHY from "../../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../../utils/formatting";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";
import ACTION_TYPES from "../../../redux/actionTypes";

const NumPad = ({ transactionPadBalance, wallet, balance, emit, dispatch }) => {
  const isSatoshiDenominated = true;
  const availableBalance = balance?.sat;

  const onPress = (n) => {
    if (n === "<") {
      if (transactionPadBalance?.length > 1) {
        const newBalance = transactionPadBalance?.slice(
          0,
          transactionPadBalance?.length - 1
        );

        dispatch({
          type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_BALANCE,
          payload: {
            transactionPadBalance: newBalance,
          },
        });
      } else {
        dispatch({
          type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_BALANCE,
          payload: {
            transactionPadBalance: "0",
          },
        });
      }
      return;
    }
    if (n === "." && transactionPadBalance.includes(".")) {
      dispatch({
        type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_ERROR,
        payload: {
          transactionPadError: "Already used decimal point.",
        },
      });
      return;
    }

    if (parseFloat(transactionPadBalance + n) > parseFloat(availableBalance)) {
      dispatch({
        type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_ERROR,
        payload: {
          transactionPadError: "Insuffient balance.",
        },
      });
      return;
    }

    dispatch({
      type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_BALANCE,
      payload: {
        transactionPadBalance:
          transactionPadBalance === "0" ? n : transactionPadBalance + n,
      },
    });
  };

  const onLongPress = ({ n }) => {
    if (n === "<") {
      dispatch({
        type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_BALANCE,
        payload: {
          transactionPadBalance: "0",
        },
      });
    }
  };

  const onPressSend = () => {
    const testNetFaucet = "bchtest:qzl7ex0q35q2d6aljhlhzwramp09n06fry8ssqu0qp";
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: testNetFaucet,
        satsToSend: "100",
      },
    });
  };

  const onPressReceive = () => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_STATE,
      payload: {
        transactionPadState: "Receive",
      },
    });
  };

  const InputButton = ({ n }) => {
    return (
      <Pressable
        style={styles.inputButton}
        onPress={() => onPress(n)}
        onLongPress={() => onLongPress(n)}
      >
        <Text style={TYPOGRAPHY.h1black}>{n}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.inputBackground}>
      <View style={styles.numPad}>
        <View style={styles.numPadRow}>
          <InputButton n={"1"} />
          <InputButton n={"2"} />
          <InputButton n={"3"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"4"} />
          <InputButton n={"5"} />
          <InputButton n={"6"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"7"} />
          <InputButton n={"8"} />
          <InputButton n={"9"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"<"} />
          <InputButton n={"0"} />
          <InputButton n={isSatoshiDenominated ? "" : "."} />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={onPressSend} isSmall>
          Send
        </Button>
        <Button variant="secondary" onPress={onPressReceive} isSmall>
          Receive
        </Button>
      </View>
    </View>
  );
};

const mapStateToProps = ({ wallet, balance, transactionPadBalance }) => ({
  wallet,
  balance,
  transactionPadBalance,
});

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(NumPad);
