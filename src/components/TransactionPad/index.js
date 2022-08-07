import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import NumPad from "../NumPad";

const TransactionPad = ({ transactionPadState, emit }) => {
  return (
    <View style={styles.transactionPad}>
      <NumPad emit={emit} />
    </View>
  );
};
const mapStateToProps = ({ transactionPadState }) => ({
  transactionPadState,
});

export default connect(mapStateToProps)(TransactionPad);
