import React, {  useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "../styles";
import { toggleIsShowAvailableBalance } from "../../../../../redux/reducers/settingsReducer";
import useActiveWalletBalance from "../../../../../hooks/useActiveWalletBalance";

function AvailableBalance() {
  const [isDisplayHideNotice, setIsDisplayHideNotice] = useState(false);
  const { primaryBalance, secondaryBalance } = useActiveWalletBalance()

  const dispatch = useDispatch()

  const onPressBalance = () => {
    setIsDisplayHideNotice(true);
    setTimeout(() => {
      setIsDisplayHideNotice(false)
    }, 10000)
  };

  const onPressHideNotice = () => {
    // Toggle hide available balance
    dispatch(toggleIsShowAvailableBalance())
    setIsDisplayHideNotice(false);
  };

  if (isDisplayHideNotice) {
    return (
      <Pressable onPress={onPressHideNotice} style={styles.widePressable}>
        <View style={styles.primaryTitlesWrapper}>
          <Text style={TYPOGRAPHY.h2 as any}>
            Hide Available balance?
          </Text>
          <Text style={TYPOGRAPHY.pWhite as any}>Tap again to hide or wait 10 seconds to cancel. Re-enable in Tools > Settings any time.</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPressBalance} style={styles.widePressable}>
      <Text style={TYPOGRAPHY.pWhite as any}>Available Balance</Text>
      <View style={styles.primaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1 as any}>
          {primaryBalance}
        </Text>
        <Text style={TYPOGRAPHY.h2 as any}>
          {secondaryBalance}
        </Text>
      </View>
    </Pressable>
  );
}

export default AvailableBalance;
