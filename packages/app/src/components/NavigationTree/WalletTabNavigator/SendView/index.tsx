import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useDispatch } from "react-redux";
import TransactionPad from "./TransactionPad";
import styles from "./styles";
import { updateTransactionPadBalance } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import GreyBar from "@selene-wallet/app/src/components/atoms/GreyBar";

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

  const onPressToReceive = () => {
    navigation.navigate("Receive");
  };

  const onPressToWallets = () => {
    navigation.navigate("Wallets");
  };

  return (
    <View style={styles.container as any}>
      <GreyBar
        text={"Swipe left to Receive"}
        leftIcon="faArrowLeft"
        rightIcon={"faBitcoinSign"}
        onPress={onPressToReceive}
        isThin
      />
      <TransactionPad navigation={navigation} />
      <GreyBar text={"Tap for Wallets & History"} onPress={onPressToWallets} />
    </View>
  );
}

export default SendView;
