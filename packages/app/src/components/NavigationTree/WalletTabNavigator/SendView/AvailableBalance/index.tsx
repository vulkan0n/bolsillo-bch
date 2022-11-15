import React from "react";
import { View, Pressable, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import { selectActiveWalletBalance } from "@selene-wallet/app/src/redux/selectors";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { toggleIsBchDenominated } from "@selene-wallet/app/src/redux/reducers/settingsReducer";

function AvailableBalance() {
  const dispatch = useDispatch();
  const { primaryBalance, secondaryBalance } = useSelector(
    (state: ReduxState) => selectActiveWalletBalance(state)
  );

  const onPressSwapDenomination = () => {
    dispatch(toggleIsBchDenominated());
  };

  return (
    <Pressable
      style={styles.container as any}
      onPress={onPressSwapDenomination}
    >
      <Text style={TYPOGRAPHY.pWhite as any}>Available Balance</Text>
      <View style={styles.primaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1 as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.h2 as any}>{secondaryBalance}</Text>
      </View>
    </Pressable>
  );
}

export default AvailableBalance;
