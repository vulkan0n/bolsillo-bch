import React from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TYPOGRAPHY from "@selene/common/design/typography";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@selene/app/src/types";
import { toggleIsBchDenominated } from "@selene/app/src/redux/reducers/settingsReducer";
import {
  selectPrimaryCurrencyOrDenomination,
  selectPadPrimaryBalance,
  selectPadSecondaryBalance,
  selectActiveWalletBalance,
} from "@selene/app/src/redux/selectors";
import { convertRawSatsToRawCurrencyRounded } from "@selene/app/src/utils/formatting";
import { updateTransactionPadBalance } from "@selene/app/src/redux/reducers/transactionPadReducer";
import COLOURS from "@selene/common/design/colours";
import {
  convertRawCurrencyToRawSats,
  prettifyRawCurrency,
} from "@selene/app/src/utils/formatting";

interface Props {
  isHideMaxButton?: boolean;
  isHideZeroButton?: boolean;
}

const LiveBalance = ({
  isHideMaxButton = false,
  isHideZeroButton = false,
}: Props) => {
  const dispatch = useDispatch();
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

  const { availableRawSats } = useSelector((state: ReduxState) =>
    selectActiveWalletBalance(state)
  );

  const maxPadBalance = convertRawSatsToRawCurrencyRounded(
    availableRawSats,
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
  const isActions = !isHideMaxButton || !isHideZeroButton;

  const ZeroBlock = isHideZeroButton ? (
    EmptyBlock
  ) : (
    <View style={styles.sideBlock as any}>
      <Pressable onPress={onPressZero}>
        <Text style={actionStyle(isZeroDisabled)}>ZERO</Text>
      </Pressable>
    </View>
  );

  const MaxBlock = isHideMaxButton ? (
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
      {isActions && (isRightHandedMode ? ZeroBlock : MaxBlock)}
      <Pressable
        onPress={onPressSwapDenomination}
        style={styles.secondaryTitlesWrapper as any}
      >
        <Text style={TYPOGRAPHY.h1black as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.h2black as any}>{secondaryBalance}</Text>
        {!!error && <Text style={styles.padError as any}>{error}</Text>}
      </Pressable>
      {isActions && (isRightHandedMode ? MaxBlock : ZeroBlock)}
    </View>
  );
};

export default LiveBalance;
