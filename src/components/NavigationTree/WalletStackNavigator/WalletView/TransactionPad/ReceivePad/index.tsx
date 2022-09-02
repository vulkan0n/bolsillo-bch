import React from "react";
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
import { ONE_HUNDRED_MILLION } from "../../../../../../utils/consts";

const ReceivePad = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const padBalanceInSats = useSelector((state: ReduxState) =>
    selectPadBalanceInRawSats(state)
  );

  const isZeroBalance = useSelector((state: ReduxState) =>
    selectIsActiveWalletZeroBalance(state)
  );

  const logo = require("../../../../../../assets/images/bch.png");
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

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "",
      })
    );
  };

  return (
    <View style={styles.inputBackground as any}>
      <Pressable onPress={onPressClipboard} style={styles.receivePad as any}>
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
        <FontAwesomeIcon
          icon={iconImport("faPaste")}
          size={30}
          color={COLOURS.black}
        />
      </Pressable>
      {!isZeroBalance && (
        <View style={styles.buttonContainer as any}>
          <Button
            icon={"faChevronLeft"}
            variant="secondary"
            onPress={onPressBack}
            size={"small"}
          >
            Back
          </Button>
        </View>
      )}
    </View>
  );
};

export default ReceivePad;
