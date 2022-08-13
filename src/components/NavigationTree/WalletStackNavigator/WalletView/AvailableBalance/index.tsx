import React, {  useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "../styles";
import { displaySats, displaySatsAsUsd } from "../../../../../utils/formatting";
import { ReduxState } from "../../../../../types";
import { toggleIsShowAvailableBalance } from "../../../../../redux/reducers/settingsReducer";

function AvailableBalance() {
  const [isDisplayHideNotice, setIsDisplayHideNotice] = useState(false);
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { balance } = useSelector((state: ReduxState) => state.bridge);
  const { isCryptoDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
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

  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

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
      <View style={styles.primaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1 as any}>
          {isCryptoDenominated ? satBalance : usdBalance}
        </Text>
        <Text style={TYPOGRAPHY.h2 as any}>
          {isCryptoDenominated ? usdBalance : satBalance}
        </Text>
      </View>
    </Pressable>
  );
}

export default AvailableBalance;
