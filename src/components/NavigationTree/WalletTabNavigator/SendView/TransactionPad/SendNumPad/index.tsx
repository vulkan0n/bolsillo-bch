import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "@redux/reducers/transactionPadReducer";
import LiveBalance from "@atoms/LiveBalance";
import NumPad from "../../../../../atoms/NumPad";
import { clearTransactionPad } from "@redux/reducers/transactionPadReducer";

const SendNumPad = ({ navigation }) => {
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

      <Button icon={"faPaperPlane"} onPress={onPressSend} isSmall>
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
