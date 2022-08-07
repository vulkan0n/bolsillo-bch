import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import NumPad from "./NumPad";
import ReceivePad from "./ReceivePad";
import LiveBalance from "./LiveBalance";

const TransactionPad = ({ transactionPadState, emit }) => {
  const component = () => {
    switch (transactionPadState) {
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
const mapStateToProps = ({ transactionPadState }) => ({
  transactionPadState,
});

export default connect(mapStateToProps)(TransactionPad);
