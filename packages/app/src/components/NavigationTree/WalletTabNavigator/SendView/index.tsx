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
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: COLOURS.veryLightGrey,
          paddingBottom: SPACING.five,
          width: "100%",
        }}
      >
        <FontAwesomeIcon
          icon={iconImport("faArrowLeft")}
          size={20}
          color={COLOURS.black}
        />
        <Text
          style={{
            ...TYPOGRAPHY.p,
            marginTop: 5,
            marginBottom: 5,
            marginLeft: 15,
            marginRight: 15,
          }}
        >
          Swipe to Receive
        </Text>
        <FontAwesomeIcon
          icon={iconImport("faBitcoinSign")}
          size={20}
          color={COLOURS.black}
        />
      </View>
      <TransactionPad navigation={navigation} />
    </View>
  );
}

export default SendView;
