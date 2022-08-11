import React, { useEffect } from "react";
import { View, Text, DeviceEventEmitter } from "react-native";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import TextInput from "../../../../atoms/TextInput";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
} from "../../../../../redux/reducers/transactionPadReducer";
import { EmitEvent, ReduxState } from "../../../../../types";
import { formatStringToCashAddress } from "../../../../../utils/formatting";

const SendPad = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const emit = (event: EmitEvent) =>
    DeviceEventEmitter.emit("event.emitEvent", event);

  useEffect(() => {
    return () => {
      DeviceEventEmitter.removeAllListeners("event.emitEvent");
    };
  }, []);

  const onPressSend = () => {
    const jeremyBchAddress =
      "bitcoincash:qpjhf0jewa50puz3r3en5y0st3g0ndu25ctdax4axv";
    const testNetFaucet = "bchtest:qzl7ex0q35q2d6aljhlhzwramp09n06fry8ssqu0qp";
    const receivingAddress = isTestNet ? testNetFaucet : jeremyBchAddress;
    console.log({ isTestNet, receivingAddress, padBalance, sendToAddress });

    // emit({
    //   type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
    //   data: {
    //     mnemonic: wallet?.mnemonic,
    //     derivationPath: wallet?.derivationPath,
    //     recipientCashAddr: receivingAddress,
    //     satsToSend: padBalance,
    //     isTestNet,
    //   },
    // });
  };

  const onChangeTextInput = (value) => {
    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: formatStringToCashAddress(value),
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
          <TextInput text={sendToAddress} onChange={onChangeTextInput} />
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
