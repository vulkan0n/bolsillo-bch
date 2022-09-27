import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import TransactionPad from "./TransactionPad";
import styles from "./styles";
import { updateTransactionPadBalance } from "../../../../redux/reducers/transactionPadReducer";

function SendView({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(
        updateTransactionPadBalance({
          padBalance: "0",
        })
      );
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container as any}>
      <TransactionPad navigation={navigation} />
    </View>
  );
}

export default SendView;
