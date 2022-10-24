import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import { useDispatch, useSelector } from "react-redux";
import LiveBalance from "@selene-wallet/app/src/components/atoms/LiveBalance";
import { updateTransactionPadBalance } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import NumPad from "@selene-wallet/app/src/components/atoms/NumPad";
import { ReduxState } from "@selene-wallet/common/dist/types";

const ReceiveNumPad = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressBack = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );
    navigation.navigate("Wallet Home");
  };

  const onPressOk = () => {
    navigation.navigate("Wallet Home");
  };

  const RequestButton = (
    <Button
      icon={"faPlusCircle"}
      variant="primary"
      onPress={onPressOk}
      size={"small"}
    >
      Request
    </Button>
  );

  return (
    <View style={styles.inputBackground as any}>
      <LiveBalance isHideMaxButton isHideZeroButton />
      <NumPad />
      <View style={styles.buttonContainer as any}>
        {!isRightHandedMode && RequestButton}
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          size={"small"}
        >
          Back
        </Button>
        {isRightHandedMode && RequestButton}
      </View>
    </View>
  );
};

export default ReceiveNumPad;
