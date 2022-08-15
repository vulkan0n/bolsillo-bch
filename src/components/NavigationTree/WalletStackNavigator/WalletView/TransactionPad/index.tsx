import React from "react";
import { View } from "react-native";
import styles from "./styles";
import NumPad from "./NumPad";
import SendPad from "./SendPad";
import ReceivePad from "./ReceivePad";
import Confirm from "./Confirm";
import LiveBalance from "./LiveBalance";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../../../types";

const TransactionPad = () => {
  const { view } = useSelector((state: ReduxState) => state.transactionPad);

  const component = () => {
    switch (view) {
      case "Send":
        return <SendPad />;
      case "Receive":
        return <ReceivePad />;
      case "NumPad":
        return <NumPad />;
      case "Confirm":
        return <Confirm />;
      case "":
        return <NumPad />;
      default:
        return <NumPad />;
    }
  };

  return (
    <View style={styles.transactionPad as any}>
      {view !== "Receive" && <LiveBalance />}
      {component()}
    </View>
  );
};

export default TransactionPad;
