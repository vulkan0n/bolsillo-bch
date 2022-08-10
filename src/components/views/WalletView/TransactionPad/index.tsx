import React from "react";
import { View } from "react-native";
import styles from "./styles";
import NumPad from "./NumPad";
import ReceivePad from "./ReceivePad";
import LiveBalance from "./LiveBalance";
import { useSelector } from "react-redux";

const TransactionPad = ({ emit }) => {
  const { view } = useSelector((state) => state.transactionPad);

  const component = () => {
    switch (view) {
      case "Receive":
        return <ReceivePad emit={emit} />;
      case "":
        return <NumPad emit={emit} />;
      default:
        return <NumPad emit={emit} />;
    }
  };

  return (
    <View style={styles.transactionPad}>
      <LiveBalance />
      {component()}
    </View>
  );
};

export default TransactionPad;
