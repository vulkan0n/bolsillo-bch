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
  selectPadPrimaryBalance,
  selectPadSecondaryBalance,
} from "@redux/selectors";
import { convertRawSatsToRawCurrencyRounded } from "@utils/formatting";
import { updateTransactionPadBalance } from "@redux/reducers/transactionPadReducer";
import COLOURS from "../../../../../../design/colours";
import {
  convertRawCurrencyToRawSats,
  prettifyRawCurrency,
} from "@utils/formatting";

interface Props {
  isHideActionButtons?: boolean;
}

const LiveBalance = ({ isHideActionButtons = false }: Props) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { error } = useSelector((state: ReduxState) => state.transactionPad);
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const primaryBalance = useSelector((state: ReduxState) =>
    selectPadPrimaryBalance(state)
  );
  const secondaryBalance = useSelector((state: ReduxState) =>
    selectPadSecondaryBalance(state)
  );

  const availableSats = wallet.balance.toString();
  const maxPadBalance = convertRawSatsToRawCurrencyRounded(
    availableSats,
    primaryCurrency
  );

  const onPressSwapDenomination = () => {
    dispatch(toggleIsBchDenominated());
  };

  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressZero = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );
  };

  const onPressMax = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: maxPadBalance,
      })
    );
  };

  const EmptyBlock = <View style={styles.sideBlock as any}></View>;

  const actionStyle = (isDisabled: boolean) => ({
    ...TYPOGRAPHY.h2black,
    color: isDisabled ? COLOURS.lightGrey : COLOURS.bchGreen,
  });
  const isMaxDisabled =
    primaryBalance === prettifyRawCurrency(maxPadBalance, primaryCurrency);
  const zeroBalance = convertRawCurrencyToRawSats(padBalance, primaryCurrency);
  const isZeroDisabled = zeroBalance === "0";

  const ZeroBlock = isHideActionButtons ? (
    EmptyBlock
  ) : (
    <View style={styles.sideBlock as any}>
      <Pressable onPress={onPressZero}>
        <Text style={actionStyle(isZeroDisabled)}>ZERO</Text>
      </Pressable>
    </View>
  );

  const MaxBlock = isHideActionButtons ? (
    EmptyBlock
  ) : (
    <View style={styles.sideBlock as any}>
      <Pressable onPress={onPressMax}>
        <Text style={actionStyle(isMaxDisabled)}>MAX</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container as any}>
      {isRightHandedMode ? ZeroBlock : MaxBlock}
      <Pressable
        onPress={onPressSwapDenomination}
        style={styles.secondaryTitlesWrapper}
      >
        <Text style={TYPOGRAPHY.h1black as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.h2black as any}>{secondaryBalance}</Text>
        {!!error && <Text style={styles.padError as any}>{error}</Text>}
      </Pressable>
      {isRightHandedMode ? MaxBlock : ZeroBlock}
    </View>
  );
};

export default LiveBalance;
