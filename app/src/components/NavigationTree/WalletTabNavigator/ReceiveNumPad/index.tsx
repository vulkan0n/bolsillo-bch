import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import LiveBalance from "@atoms/LiveBalance";
import { updateTransactionPadBalance } from "@redux/reducers/transactionPadReducer";
import NumPad from "../../../atoms/NumPad";

const ReceiveNumPad = ({ navigation }) => {
  const dispatch = useDispatch();

  const onPressOk = () => {
    navigation.navigate("Wallet Home");
  };

  return (
    <View style={styles.inputBackground as any}>
      <LiveBalance isHideMaxButton isHideZeroButton />
      <NumPad />
      <View style={styles.buttonContainer as any}>
        <Button
          icon={"faPlusCircle"}
          variant="primary"
          onPress={onPressOk}
          size={"small"}
        >
          Add
        </Button>
      </View>
    </View>
  );
};

export default ReceiveNumPad;
