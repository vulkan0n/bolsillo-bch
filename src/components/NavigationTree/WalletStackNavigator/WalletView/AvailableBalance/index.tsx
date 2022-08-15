import React, {  useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "../styles";
import { displaySatsAsUsd, rawSatsToCurrencyDisplay } from "../../../../../utils/formatting";
import { ReduxState } from "../../../../../types";
import { toggleIsShowAvailableBalance } from "../../../../../redux/reducers/settingsReducer";

function AvailableBalance() {
  const [isDisplayHideNotice, setIsDisplayHideNotice] = useState(false);
  const wallet = useSelector((state: ReduxState) =>
    state.walletManager?.wallets?.find(
      ({ name }) => name === state.walletManager?.activeWalletName
    )
  );
  
  const { isBchDenominated } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { bitcoinDenomination } = useSelector(
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

  const bchBalance = rawSatsToCurrencyDisplay(wallet?.balance, bitcoinDenomination);
  const usdBalance = displaySatsAsUsd(wallet?.balance);

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
          {isBchDenominated ? bchBalance : usdBalance}
        </Text>
        <Text style={TYPOGRAPHY.h2 as any}>
          {isBchDenominated ? usdBalance : bchBalance}
        </Text>
      </View>
    </Pressable>
  );
}

export default AvailableBalance;
