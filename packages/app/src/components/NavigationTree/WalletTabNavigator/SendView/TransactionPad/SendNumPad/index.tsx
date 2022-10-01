import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@selene/app/src/components/atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "@selene/app/src/redux/reducers/transactionPadReducer";
import LiveBalance from "@selene/app/src/components/atoms/LiveBalance";
import NumPad from "../../../../../atoms/NumPad";
import { clearTransactionPad } from "@selene/app/src/redux/reducers/transactionPadReducer";

const SendNumPad = () => {
  const dispatch = useDispatch();

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Confirm",
      })
    );
  };

  const onPressBack = () => {
    dispatch(clearTransactionPad());
  };

  return (
    <View style={styles.inputBackground as any}>
      <LiveBalance />
      <NumPad isCheckInsufficientBalance />

      <Button icon={"faPaperPlane"} onPress={onPressSend} size="small">
        Send
      </Button>
      <Button
        icon={"faChevronLeft"}
        variant="secondary"
        onPress={onPressBack}
        size={"small"}
      >
        Back
      </Button>
    </View>
  );
};

export default SendNumPad;
