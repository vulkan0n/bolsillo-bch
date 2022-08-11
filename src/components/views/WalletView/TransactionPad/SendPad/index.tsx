import React from "react";
import { View, Text, DeviceEventEmitter } from "react-native";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import TextInput from "../../../../atoms/TextInput";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
  updateTransactionPadBalance,
} from "../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../types";
import { formatStringToCashAddress } from "../../../../../utils/formatting";
import emit from "../../../../../utils/emit";

const SendPad = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const onPressSend = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: sendToAddress,
        satsToSend: padBalance,
        isTestNet,
      },
    });

    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );
    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: "",
      })
    );
    dispatch(
      updateTransactionPadView({
        sendToAddress: "",
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

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.numPad as any}>
        <View style={styles.numPadRow as any}>
          <Text>QR scanner</Text>
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
        <Button onPress={onPressSend} isSmall>
          Send
        </Button>
        <Button variant="secondary" onPress={onPressBack} isSmall>
          Back
        </Button>
      </View>
    </View>
  );
};

export default SendPad;
