import React from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "@design/typography";
import { convertBalanceToDisplay, prettifyPadBalance } from "@utils/formatting";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@types";
import { toggleIsBchDenominated } from "@redux/reducers/settingsReducer";
import {
  selectActiveWallet,
  selectPrimaryCurrencyOrDenomination,
} from "@redux/selectors";
import { convertRawSatsToRawCurrencyRounded } from "@utils/formatting";
import { updateTransactionPadBalance } from "@redux/reducers/transactionPadReducer";

interface Props {
  isHideMaxButton?: boolean;
}

const LiveBalance = ({ isHideMaxButton = false }: Props) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { error } = useSelector((state: ReduxState) => state.transactionPad);
  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    useSelector((state: ReduxState) => state.settings);
  const inputCurrency = isBchDenominated
    ? bitcoinDenomination
    : contrastCurrency;

  const primaryBalance = prettifyPadBalance(
    padBalance,
    isBchDenominated ? bitcoinDenomination : contrastCurrency
  );
  const secondaryBalance = convertBalanceToDisplay(
    padBalance,
    inputCurrency,
    isBchDenominated ? contrastCurrency : bitcoinDenomination
  );

  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );

  const onPressSwapDenomination = () => {
    dispatch(toggleIsBchDenominated());
  };

  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressMax = () => {
    const availableSats = wallet.balance.toString();
    const newPadBalance = convertRawSatsToRawCurrencyRounded(
      availableSats,
      primaryCurrency
    );
    dispatch(
      updateTransactionPadBalance({
        padBalance: newPadBalance,
      })
    );
  };

  const EmptyBlock = <View style={styles.sideBlock as any}></View>;

  const MaxBlock = isHideMaxButton ? (
    EmptyBlock
  ) : (
    <View style={styles.sideBlock as any}>
      <Pressable onPress={onPressMax}>
        <Text style={TYPOGRAPHY.h2Green}>MAX</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container as any}>
      {isRightHandedMode ? EmptyBlock : MaxBlock}
      <Pressable
        onPress={onPressSwapDenomination}
        style={styles.secondaryTitlesWrapper}
      >
        <Text style={TYPOGRAPHY.h1black as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.h2black as any}>{secondaryBalance}</Text>
        {!!error && <Text style={styles.padError as any}>{error}</Text>}
      </Pressable>
      {isRightHandedMode ? MaxBlock : EmptyBlock}
    </View>
  );
};

export default LiveBalance;
