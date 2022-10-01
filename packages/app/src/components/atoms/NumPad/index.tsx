import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import Button from "@selene/app/src/components/atoms/Button";
import TYPOGRAPHY from "@selene/common/design/typography";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadBalance,
  updateTransactionPadView,
  updateTransactionPadError,
} from "@selene/app/src/redux/reducers/transactionPadReducer";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SupportedCurrencyTypes,
} from "@selene/app/src/types";
import TRANSACTION_PAD_ERRORS from "../../NavigationTree/WalletTabNavigator/SendView/TransactionPad/errors";
import {
  allowedDecimalPlaces,
  convertRawCurrencyToRawSats,
} from "@selene/app/src/utils/formatting";
import { countDecimalPlaces } from "@selene/app/src/utils/utils";
import { BITCOIN_DENOMINATIONS } from "@selene/app/src/utils/consts";
import {
  selectActiveWallet,
  selectPrimaryCurrencyOrDenomination,
  selectIsActiveWalletZeroBalance,
} from "@selene/app/src/redux/selectors";

const NumPad = ({ isCheckInsufficientBalance = false }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { bitcoinDenomination, isBchDenominated, isRightHandedMode } =
    useSelector((state: ReduxState) => state.settings);
  const isZeroActiveWalletBalance = useSelector((state: ReduxState) =>
    selectIsActiveWalletZeroBalance(state)
  );

  const availableRawSats = wallet?.balance;
  const isDisableDecimal =
    padBalance.includes(".") ||
    (isBchDenominated &&
      bitcoinDenomination === BITCOIN_DENOMINATIONS.satoshis);

  const checkInsufficientBalance = (
    n: string,
    primaryCurrency: SupportedCurrencyTypes | BitcoinDenominationTypes
  ): boolean => {
    if (!isCheckInsufficientBalance) {
      return;
    }
    const proposedBalance = `${padBalance}${n}`;
    const proposedBalanceInSats = convertRawCurrencyToRawSats(
      proposedBalance,
      primaryCurrency
    );
    return parseFloat(proposedBalanceInSats) > parseFloat(availableRawSats);
  };

  const isMaxDecimals =
    padBalance.includes(".") &&
    countDecimalPlaces(padBalance) + 1 > allowedDecimalPlaces(primaryCurrency);

  const onPress = (n) => {
    dispatch(
      updateTransactionPadError({
        error: "",
      })
    );

    if (n === "<") {
      if (padBalance?.length > 1) {
        const newBalance = padBalance?.slice(0, padBalance?.length - 1);

        dispatch(
          updateTransactionPadBalance({
            padBalance: newBalance,
          })
        );
      } else {
        dispatch(
          updateTransactionPadBalance({
            padBalance: "0",
          })
        );
      }
      return;
    }

    if (n === "." && padBalance.includes(".")) {
      dispatch(
        updateTransactionPadError({
          error: TRANSACTION_PAD_ERRORS.ALREADY_USED_DECIMAL,
        })
      );
      return;
    }

    if (isMaxDecimals) {
      dispatch(
        updateTransactionPadError({
          error: TRANSACTION_PAD_ERRORS.MAXIMUM_DECIMAL_PLACES,
        })
      );
      return;
    }

    if (checkInsufficientBalance(n, primaryCurrency)) {
      dispatch(
        updateTransactionPadError({
          error: TRANSACTION_PAD_ERRORS.INSUFFICIENT_BALANCE,
        })
      );
      return;
    }

    // NB: padBalance must be the EXACT string "0"
    // So cannot use isPadZeroBalance
    // As that will include "0." and cause bugs
    dispatch(
      updateTransactionPadBalance({
        padBalance: padBalance === "0" && n !== "." ? n : padBalance + n,
      })
    );
  };

  const onLongPress = ({ n }) => {
    if (n === "<") {
      dispatch(
        updateTransactionPadBalance({
          padBalance: "0",
        })
      );
    }
  };

  const InputButton = ({ n, isDisabled = false }) => {
    return (
      <Pressable
        style={styles.inputButton as any}
        onPress={() => {
          if (isDisabled) {
            return;
          }
          onPress(n);
        }}
        onLongPress={() => {
          if (isDisabled) {
            return;
          }
          onLongPress(n);
        }}
      >
        <Text style={isDisabled ? TYPOGRAPHY.h1 : (TYPOGRAPHY.h1black as any)}>
          {n}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.numPad as any}>
      <View style={styles.numPadRow as any}>
        <InputButton
          n={"1"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("1", primaryCurrency)
          }
        />
        <InputButton
          n={"2"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("2", primaryCurrency)
          }
        />
        <InputButton
          n={"3"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("3", primaryCurrency)
          }
        />
      </View>
      <View style={styles.numPadRow as any}>
        <InputButton
          n={"4"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("4", primaryCurrency)
          }
        />
        <InputButton
          n={"5"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("5", primaryCurrency)
          }
        />
        <InputButton
          n={"6"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("6", primaryCurrency)
          }
        />
      </View>
      <View style={styles.numPadRow as any}>
        <InputButton
          n={"7"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("7", primaryCurrency)
          }
        />
        <InputButton
          n={"8"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("8", primaryCurrency)
          }
        />
        <InputButton
          n={"9"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("9", primaryCurrency)
          }
        />
      </View>
      <View style={styles.numPadRow as any}>
        <InputButton n={"<"} isDisabled={padBalance === "0"} />
        <InputButton
          n={"0"}
          isDisabled={
            isMaxDecimals || checkInsufficientBalance("0", primaryCurrency)
          }
        />
        <InputButton n={"."} isDisabled={isDisableDecimal} />
      </View>
    </View>
  );
};

export default NumPad;
