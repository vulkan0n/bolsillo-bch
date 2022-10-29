import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import * as Clipboard from "expo-clipboard";
import COLOURS from "@selene-wallet/common/design/colours";
import {
  selectActiveWallet,
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
    const addressOrRequest = isReceiveAmount ? "request" : "address";
    await Clipboard.setStringAsync(qrValue);
    Toast.show({
      type: "customSuccess",
      props: {
        title: `Copied payment ${addressOrRequest}.`,
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
        <Pressable onPress={onPressClipboard}>
          <Text selectable style={TYPOGRAPHY.p as any}>
            {isAddress ? qrValue : "Address loading..."}
          </Text>
          <Text style={TYPOGRAPHY.p as any}>{"(Tap to copy)"}</Text>
        </Pressable>
        {isZeroPadBalance && (
          <Button
            onPress={onPressAddAmount}
            variant={"secondary"}
            icon={"faPlusCircle"}
          >
            Add request amount
          </Button>
        )}
        {!isZeroPadBalance && (
          <Button
            onPress={onPressClearAmount}
            variant={"secondary"}
            icon={"faXmarkCircle"}
          >
            Clear amount
          </Button>
        )}
      </View>
    </View>
  );
};

export default ReceivePad;
