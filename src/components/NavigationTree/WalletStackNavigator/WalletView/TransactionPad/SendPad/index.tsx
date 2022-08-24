import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "../../../../../atoms/Button";
import TextInput from "../../../../../atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
} from "../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../types";
import { formatStringToCashAddress } from "../../../../../../utils/formatting";
import QrScanner from "../QrScanner";

const SendPad = () => {
  const dispatch = useDispatch();

  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Confirm",
      })
    );
  };

  const onChangeTextInput = (value) => {
    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: formatStringToCashAddress(value, isTestNet),
      })
    );
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  };

  const SendButton = (
    <Button icon={"faPaperPlane"} onPress={onPressSend} isSmall>
      Send
    </Button>
  );

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.numPad as any}>
        <View style={styles.qrScannerRow as any}>
          <QrScanner />
        </View>
        <View style={styles.numPadRow as any}>
          <TextInput
            text={sendToAddress}
            onChange={onChangeTextInput}
            isSmallText
          />
        </View>
      </View>
      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && SendButton}
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          isSmall
        >
          Back
        </Button>
        {!isRightHandedMode && SendButton}
      </View>
    </View>
  );
};

export default SendPad;
