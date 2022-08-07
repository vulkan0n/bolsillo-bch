import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import NumPad from "../NumPad";
import ReceivePad from "../ReceivePad";

const TransactionPad = ({ transactionPadState, emit }) => {
  console.log({ transactionPadState });
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

  return <View style={styles.transactionPad}>{component()}</View>;
};
const mapStateToProps = ({ transactionPadState }) => ({
  transactionPadState,
});

export default connect(mapStateToProps)(TransactionPad);
