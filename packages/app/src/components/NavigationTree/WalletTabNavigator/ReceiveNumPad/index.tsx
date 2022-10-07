import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import { useDispatch } from "react-redux";
import LiveBalance from "@selene-wallet/app/src/components/atoms/LiveBalance";
import { updateTransactionPadBalance } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
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
