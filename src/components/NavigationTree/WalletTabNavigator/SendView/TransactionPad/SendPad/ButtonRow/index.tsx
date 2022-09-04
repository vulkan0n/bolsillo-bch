import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendInputView } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import pickImage from "../pickImage";
import {
  selectPrimaryCurrencyOrDenomination,
  selectIsPadZeroBalance,
} from "@redux/selectors";

const ButtonRow = () => {
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const isZeroPadBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const { sendInputView } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const onPressText = () => {
    dispatch(
      updateTransactionPadSendInputView({
        sendInputView: "Text",
      })
    );
  };

  const onPressScan = () => {
    dispatch(
      updateTransactionPadSendInputView({
        sendInputView: "Scan",
      })
    );
  };

  const onPressImage = () => {
    pickImage({
      dispatch,
      primaryCurrency,
      isTestNet,
    });
  };

  return (
    <View style={styles.buttonContainer as any}>
      <Button
        icon="faQrcode"
        variant={
          sendInputView === "Scan" || sendInputView === ""
            ? "smallActionBlack"
            : "smallActionGreen"
        }
        onPress={onPressScan}
      >
        Scan
      </Button>
      <Button
        icon="faKeyboard"
        variant={
          sendInputView === "Text" ? "smallActionBlack" : "smallActionGreen"
        }
        onPress={onPressText}
      >
        Text
      </Button>
      <Button
        icon="faImage"
        variant={
          sendInputView === "Image" ? "smallActionBlack" : "smallActionGreen"
        }
        onPress={onPressImage}
      >
        Img
      </Button>
    </View>
  );
};

export default ButtonRow;
