import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadBalance,
  updateTransactionPadView,
  updateTransactionPadError,
} from "../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../types";

const NumPad = () => {
  const dispatch = useDispatch();
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );
  const availableBalance = balance?.sat;

  const isSendDisabled = padBalance === "0";

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
    dispatch(
      updateTransactionPadView({
        view: "Send",
      })
    );
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

  const SendButton = (
    <Button
      icon={"faPaperPlane"}
      onPress={onPressSend}
      isSmall
      isDisabled={isSendDisabled}
    >
      Send
    </Button>
  );

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
          <InputButton n={isCryptoDenominated ? "" : "."} />
        </View>
      </View>
      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && SendButton}
        <Button
          icon={"faBitcoinSign"}
          variant="secondary"
          onPress={onPressReceive}
          isSmall
        >
          Receive
        </Button>
        {!isRightHandedMode && SendButton}
      </View>
    </View>
  );
};

export default NumPad;
