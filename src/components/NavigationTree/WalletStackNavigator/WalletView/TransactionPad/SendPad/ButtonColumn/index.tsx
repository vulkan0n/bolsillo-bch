import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddressEntry } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import pickImage from "../pickImage";
import {
  selectPrimaryCurrencyOrDenomination,
  selectIsPadZeroBalance,
} from "@redux/selectors";

const ButtonColumn = () => {
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const isZeroPadBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const { sendToAddressEntry } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const onPressText = () => {
    dispatch(
      updateTransactionPadSendToAddressEntry({
        sendToAddressEntry: "Text",
      })
    );
  };

  const onPressScan = () => {
    dispatch(
      updateTransactionPadSendToAddressEntry({
        sendToAddressEntry: "Scan",
      })
    );
  };

  const onPressImage = () => {
    pickImage({
      dispatch,
      primaryCurrency,
      isZeroPadBalance,
      isTestNet,
    });
  };

  return (
    <View style={styles.buttonContainerColumn as any}>
      <Button
        icon="faKeyboard"
        variant={sendToAddressEntry === "Text" ? "primary" : "secondary"}
        onPress={onPressText}
      >
        Text
      </Button>
      <Button
        icon="faImage"
        variant={sendToAddressEntry === "Image" ? "primary" : "secondary"}
        onPress={onPressImage}
      >
        Img
      </Button>
      <Button
        icon="faQrcode"
        variant={
          sendToAddressEntry === "Scan" || sendToAddressEntry === ""
            ? "primary"
            : "secondary"
        }
        onPress={onPressScan}
      >
        Scan
      </Button>
    </View>
  );
};

export default ButtonColumn;
