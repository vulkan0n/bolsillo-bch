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

interface Props {
  emit: ({}) => {};
}

const NumPad = ({ emit }: Props) => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const isSatoshiDenominated = true;
  const availableBalance = balance?.sat;

  const onPress = (n) => {
    if (n === "<") {
      if (padBalance?.length > 1) {
        const newBalance = padBalance?.slice(0, padBalance?.length - 1);

        dispatch(
          updateTransactionPadBalance({
            padBalance: newBalance,
          })
        );
      } else {
        dispatch(
          updateTransactionPadBalance({
            padBalance: "0",
          })
        );
      }
      return;
    }
    if (n === "." && padBalance.includes(".")) {
      dispatch(
        updateTransactionPadError({
          error: "Already used decimal point.",
        })
      );
      return;
    }

    if (parseFloat(padBalance + n) > parseFloat(availableBalance)) {
      dispatch(
        updateTransactionPadError({
          error: "Insuffient balance.",
        })
      );
      return;
    }

    dispatch(
      updateTransactionPadBalance({
        padBalance: padBalance === "0" ? n : padBalance + n,
      })
    );
  };

  const onLongPress = ({ n }) => {
    if (n === "<") {
      dispatch(
        updateTransactionPadBalance({
          padBalance: "0",
        })
      );
    }
  };

  const onPressSend = () => {
    const jeremyBchAddress =
      "bitcoincash:qpjhf0jewa50puz3r3en5y0st3g0ndu25ctdax4axv";
    const testNetFaucet = "bchtest:qzl7ex0q35q2d6aljhlhzwramp09n06fry8ssqu0qp";
    const receivingAddress = isTestNet ? testNetFaucet : jeremyBchAddress;

    console.log({ isTestNet, receivingAddress });
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: testNetFaucet,
        satsToSend: "1599",
        isTestNet,
      },
    });
  };

  const onPressReceive = () => {
    dispatch(
      updateTransactionPadView({
        view: "Receive",
      })
    );
  };

  const InputButton = ({ n }) => {
    return (
      <Pressable
        style={styles.inputButton as any}
        onPress={() => onPress(n)}
        onLongPress={() => onLongPress(n)}
      >
        <Text style={TYPOGRAPHY.h1black as any}>{n}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.numPad as any}>
        <View style={styles.numPadRow as any}>
          <InputButton n={"1"} />
          <InputButton n={"2"} />
          <InputButton n={"3"} />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton n={"4"} />
          <InputButton n={"5"} />
          <InputButton n={"6"} />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton n={"7"} />
          <InputButton n={"8"} />
          <InputButton n={"9"} />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton n={"<"} />
          <InputButton n={"0"} />
          <InputButton n={isSatoshiDenominated ? "" : "."} />
        </View>
      </View>
      <View style={styles.buttonContainer as any}>
        <Button onPress={onPressSend} isSmall>
          Send
        </Button>
        <Button variant="secondary" onPress={onPressReceive} isSmall>
          Receive
        </Button>
      </View>
    </View>
  );
};

export default NumPad;
