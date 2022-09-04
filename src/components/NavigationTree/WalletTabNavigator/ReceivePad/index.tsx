import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import Button from "@atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "@design/typography";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@design/colours";
import { iconImport } from "@design/icons";
import {
  selectActiveWallet,
  selectIsActiveWalletZeroBalance,
  selectPadBalanceInRawSats,
} from "@redux/selectors";
import { ONE_HUNDRED_MILLION } from "@utils/consts";
import LiveBalance from "@components/LiveBalance";
import { updateTransactionPadBalance } from "@redux/reducers/transactionPadReducer";
import { selectIsPadZeroBalance } from "@redux/selectors";

const ReceivePad = ({ navigation }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const padBalanceInSats = useSelector((state: ReduxState) =>
    selectPadBalanceInRawSats(state)
  );

  const isZeroPadBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );
  const isZeroActiveWalletBalance = useSelector((state: ReduxState) =>
    selectIsActiveWalletZeroBalance(state)
  );

  const logo = require("../../../../assets/images/bch.png");
  const isAddress = wallet?.cashaddr;
  const isReceiveAmount = padBalanceInSats !== "0";
  const receiveAmountInBch = padBalanceInSats / ONE_HUNDRED_MILLION;
  const qrValue = `${wallet?.cashaddr}${
    isReceiveAmount ? `?amount=${receiveAmountInBch}` : ""
  }`;

  const onPressClipboard = async () => {
    await Clipboard.setStringAsync(qrValue);
    Toast.show({
      type: "customSuccess",
      props: {
        title: "Copied request.",
        text: qrValue ?? "",
      },
    });
  };

  const onPressClearAmount = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );
  };

  const onPressAddAmount = () => {
    navigation.navigate("Receive Num Pad");
  };

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Send",
      })
    );
  };

  const SendButton = (
    <Button
      icon={"faPaperPlane"}
      onPress={onPressSend}
      size={"small"}
      isDisabled={isZeroActiveWalletBalance}
    >
      Send
    </Button>
  );

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.receivePad as any}>
        {!isZeroPadBalance && <LiveBalance isHideZeroButton isHideMaxButton />}
        <View style={styles.qrBorder}>
          {isAddress && (
            <QRCode
              size={215}
              value={qrValue}
              color={COLOURS.black}
              logo={logo}
              logoSize={60}
            />
          )}
        </View>
        <Text selectable style={TYPOGRAPHY.p as any}>
          {isAddress ? qrValue : "Address loading..."}
        </Text>
        <View style={styles.buttonContainer as any}>
          <Button
            onPress={onPressClipboard}
            variant={"smallActionGreen"}
            icon={"faPaste"}
          >
            Copy
          </Button>
          {isZeroPadBalance && (
            <Button
              onPress={onPressAddAmount}
              variant={"smallActionGreen"}
              icon={"faPlusCircle"}
            >
              Amount
            </Button>
          )}
          {!isZeroPadBalance && (
            <Button
              onPress={onPressClearAmount}
              variant={"smallActionGreen"}
              icon={"faXmarkCircle"}
            >
              Clear
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

export default ReceivePad;
