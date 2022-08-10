import React from "react";
import { View } from "react-native";
import styles from "./styles";
import NumPad from "./NumPad";
import ReceivePad from "./ReceivePad";
import LiveBalance from "./LiveBalance";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../../types";

const TransactionPad = ({ emit }) => {
  const { view } = useSelector((state: ReduxState) => state.transactionPad);

  const component = () => {
    switch (view) {
      case "Receive":
        return <ReceivePad />;
      case "":
        return <NumPad emit={emit} />;
      default:
        return <NumPad emit={emit} />;
    }
  };

  return (
    <View style={styles.transactionPad as any}>
      <LiveBalance />
      {component()}
    </View>
  );
};

export default TransactionPad;
