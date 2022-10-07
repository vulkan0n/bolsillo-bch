import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene-wallet/common/dist/types";
import * as Clipboard from "expo-clipboard";
import COLOURS from "@selene-wallet/common/design/colours";
import {
  selectActiveWallet,
  selectIsActiveWalletZeroBalance,
  selectPadBalanceInRawSats,
} from "@selene-wallet/app/src/redux/selectors";
import { ONE_HUNDRED_MILLION } from "@selene-wallet/common/dist/utils/consts";
import LiveBalance from "@selene-wallet/app/src/components/atoms/LiveBalance";
import { updateTransactionPadBalance } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { selectIsPadZeroBalance } from "@selene-wallet/app/src/redux/selectors";

const ReceivePad = ({ navigation }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const padBalanceInSats = useSelector((state: ReduxState): string =>
    selectPadBalanceInRawSats(state)
  );

  const isZeroPadBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );

  const padBalanceInIntSats = parseInt(padBalanceInSats);

  const logo = require("../../../../assets/images/bch.png");
  const isAddress = wallet?.cashaddr;
  const isReceiveAmount = padBalanceInSats !== "0";
  const receiveAmountInBch = padBalanceInIntSats / ONE_HUNDRED_MILLION;
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

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.receivePad as any}>
        {!isZeroPadBalance && <LiveBalance isHideZeroButton isHideMaxButton />}
        <View style={styles.qrBorder}>
          {isAddress && (
            <QRCode
              size={200}
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
