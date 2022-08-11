import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadBalance,
  updateTransactionPadView,
  updateTransactionPadError,
} from "../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../types";

const SendPad = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const onPressSend = () => {
    // const jeremyBchAddress =
    //   "bitcoincash:qpjhf0jewa50puz3r3en5y0st3g0ndu25ctdax4axv";
    // const testNetFaucet = "bchtest:qzl7ex0q35q2d6aljhlhzwramp09n06fry8ssqu0qp";
    // const receivingAddress = isTestNet ? testNetFaucet : jeremyBchAddress;
    // console.log({ isTestNet, receivingAddress });
    // emit({
    //   type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
    //   data: {
    //     mnemonic: wallet?.mnemonic,
    //     derivationPath: wallet?.derivationPath,
    //     recipientCashAddr: receivingAddress,
    //     satsToSend: isTestNet ? "1099" : "10599",
    //     isTestNet,
    //   },
    // });
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
        <View style={styles.numPadRow as any}></View>
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
