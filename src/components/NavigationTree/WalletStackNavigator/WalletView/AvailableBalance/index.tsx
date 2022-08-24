import React, {  useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "../styles";
import { toggleIsShowAvailableBalance } from "../../../../../redux/reducers/settingsReducer";
import useActiveWalletBalance from "../../../../../hooks/useActiveWalletBalance";
import { createSelector } from "@reduxjs/toolkit";
import { convertBalanceToDisplay } from "../../../../../utils/formatting";

function AvailableBalance() {
  const [isDisplayHideNotice, setIsDisplayHideNotice] = useState(false);
  const selectActiveWallet = createSelector(
  state => state.walletManager?.wallets,
  state => state.walletManager?.activeWalletName,
  (wallets, activeWalletName) => wallets?.find(
    ({ name }) => name === activeWalletName
  )
  )
  const activeWallet = useSelector(state => selectActiveWallet(state))
  const activeBalanceSelector = createSelector(
    selectActiveWallet,
    state => state.settings.isBchDenominated,
    state => state.settings.bitcoinDenomination,
    state => state.settings.contrastCurrency,
    (wallet, isBchDenominated, bitcoinDenomination, contrastCurrency) => {
  const bchBalance = convertBalanceToDisplay(
    wallet?.balance,
    "satoshis",
    bitcoinDenomination
  );

  const contrastBalance = convertBalanceToDisplay(
    wallet?.balance,
    "satoshis",
    contrastCurrency
  );

  const isZeroBalance = parseInt(wallet?.balance) === 0;
  const primaryBalance = isBchDenominated ? bchBalance : contrastBalance;
  const secondaryBalance = isBchDenominated ? contrastBalance : bchBalance;

    return {
      isZeroBalance,
      primaryBalance,
      secondaryBalance
    }
    }
  )  

  const activeBalance = useSelector(state => activeBalanceSelector(state))


  console.log({ activeWallet, activeBalance })

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
          {activeBalance?.primaryBalance}
        </Text>
        <Text style={TYPOGRAPHY.h2 as any}>
          {activeBalance?.secondaryBalance}
        </Text>
      </View>
    </Pressable>
  );
}

export default AvailableBalance;
