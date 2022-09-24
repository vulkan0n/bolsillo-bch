import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
  updateTransactionPadIsSendingCoins,
} from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import emit from "@utils/emit";
import TYPOGRAPHY from "@design/typography";
import {
  selectActiveWallet,
  selectPadBalanceInRawSats,
} from "@redux/selectors";
import LiveBalance from "@components/LiveBalance";
import COLOURS from "@design/colours";
import { TEN_SECONDS } from "@utils/consts";
import { selectIsPadZeroBalance } from "../../../../../../redux/selectors";
import NumPad from "../../../../../atoms/NumPad";
import {
  clearTransactionPad,
  updateTransactionPadBalance,
} from "../../../../../../redux/reducers/transactionPadReducer";
import AvailableBalance from "../../AvailableBalance";

const SendNumPad = ({ navigation }) => {
  const dispatch = useDispatch();

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Confirm",
      })
    );
  };

  const onPressBack = () => {
    dispatch(clearTransactionPad());
  };

  return (
    <View style={styles.inputBackground as any}>
      <LiveBalance />
      <NumPad isCheckInsufficientBalance />

      <Button icon={"faPaperPlane"} onPress={onPressSend} isSmall>
        Send
      </Button>
      <Button
        icon={"faChevronLeft"}
        variant="secondary"
        onPress={onPressBack}
        size={"small"}
      >
        Back
      </Button>
    </View>
  );
};

export default SendNumPad;
