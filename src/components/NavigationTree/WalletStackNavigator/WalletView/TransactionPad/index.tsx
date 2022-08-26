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
import { selectActiveWalletIsZeroBalance } from "@redux/selectors";

const TransactionPad = ({ navigation }) => {
  const { view } = useSelector((state: ReduxState) => state.transactionPad);
  const isZeroBalance = useSelector((state: ReduxState) =>
    selectActiveWalletIsZeroBalance(state)
  );

  const component = () => {
    if (isZeroBalance) {
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

  return (
    <View style={styles.transactionPad as any}>
      {view !== "Receive" && view !== "Confirm" && !isZeroBalance && (
        <LiveBalance />
      )}
      {component()}
    </View>
  );
};

export default TransactionPad;
