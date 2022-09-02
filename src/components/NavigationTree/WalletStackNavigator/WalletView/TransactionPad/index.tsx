import React from "react";
import { View } from "react-native";
import styles from "./styles";
import NumPad from "./NumPad";
import SendPad from "./SendPad";
import ReceivePad from "./ReceivePad";
import Confirm from "./Confirm";
import LiveBalance from "./LiveBalance";
import { useSelector } from "react-redux";
import { ReduxState } from "@types";
import {
  selectIsActiveWalletZeroBalance,
  selectIsPadZeroBalance,
} from "@redux/selectors";

const TransactionPad = ({ navigation }) => {
  const { view } = useSelector((state: ReduxState) => state.transactionPad);
  const isZeroActiveWalletBalance = useSelector((state: ReduxState) =>
    selectIsActiveWalletZeroBalance(state)
  );
  const isPadZeroBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );

  const component = () => {
    if (isZeroActiveWalletBalance) {
      return <ReceivePad />;
    }

    switch (view) {
      case "Send":
        return <SendPad />;
      case "Receive":
        return <ReceivePad />;
      case "NumPad":
        return <NumPad />;
      case "Confirm":
        return <Confirm navigation={navigation} />;
      case "":
        return <NumPad />;
      default:
        return <NumPad />;
    }
  };

  const isHideLiveButton =
    view === "Confirm" ||
    isZeroActiveWalletBalance ||
    (view === "Receive" && isPadZeroBalance);
  const isHideActionButtons = view !== "NumPad" && view !== "";

  return (
    <View style={styles.transactionPad as any}>
      {!isHideLiveButton && (
        <LiveBalance isHideActionButtons={isHideActionButtons} />
      )}
      {component()}
    </View>
  );
};

export default TransactionPad;
