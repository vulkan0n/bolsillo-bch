import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import { useDispatch, useSelector } from "react-redux";
import { updateTransactionPadView } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import LiveBalance from "@selene-wallet/app/src/components/atoms/LiveBalance";
import NumPad from "../../../../../atoms/NumPad";
import { clearTransactionPad } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { selectIsPadBelowMinimumSpendableBalance } from "@selene-wallet/app/src/redux/selectors";
import { ReduxState } from "@selene-wallet/common/dist/types";

const SendNumPad = () => {
  const dispatch = useDispatch();
  const isBelowMinimumSpendableBalance = useSelector((state: ReduxState) =>
    selectIsPadBelowMinimumSpendableBalance(state)
  );

  const onPressOk = () => {
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

      <Button
        icon={isBelowMinimumSpendableBalance ? "" : "faArrowRight"}
        isDisabled={isBelowMinimumSpendableBalance}
        onPress={onPressOk}
        size="small"
      >
        {isBelowMinimumSpendableBalance ? "5 000 satoshi minimum" : "Next"}
      </Button>
      <Button
        icon={"faArrowLeft"}
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
