import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import SendPad from "./SendPad";
import Confirm from "./Confirm";
import SendNumPad from "./SendNumPad";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene/common/dist/types";
import { selectIsActiveWalletZeroBalance } from "@selene/app/src/redux/selectors";
import TYPOGRAPHY from "@selene/common/design/typography";

const TransactionPad = ({ navigation }) => {
  const { view } = useSelector((state: ReduxState) => state.transactionPad);
  const isZeroActiveWalletBalance = useSelector((state: ReduxState) =>
    selectIsActiveWalletZeroBalance(state)
  );

  const component = () => {
    if (isZeroActiveWalletBalance) {
      return (
        <View style={styles.emptyPad as any}>
          <Text style={TYPOGRAPHY.h1black as any}>Wallet empty!</Text>
        </View>
      );
    }

    switch (view) {
      case "Send":
        return <SendPad />;
      case "NumPad":
        return <SendNumPad />;
      case "Confirm":
        return <Confirm navigation={navigation} />;
      case "":
        return <SendPad />;
      default:
        return <SendPad />;
    }
  };

  return <View style={styles.transactionPad as any}>{component()}</View>;
};

export default TransactionPad;
