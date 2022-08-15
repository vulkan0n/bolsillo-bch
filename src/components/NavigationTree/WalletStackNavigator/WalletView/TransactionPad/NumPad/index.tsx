import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import Button from "../../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../../design/typography";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadBalance,
  updateTransactionPadView,
  updateTransactionPadError,
} from "../../../../../../redux/reducers/transactionPadReducer";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SupportedCurrencyTypes,
} from "../../../../../../types";
import TRANSACTION_PAD_ERRORS from "../errors";
import {
  allowedDecimalPlaces,
  convertRawCurrencyToRawSats,
} from "../../../../../../utils/formatting";
import { countDecimalPlaces } from "../../../../../../utils/utils";

const NumPad = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) =>
    state.walletManager?.wallets?.find(
      ({ name }) => name === state.walletManager?.activeWalletName
    )
  );
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const {
    bitcoinDenomination,
    contrastCurrency,
    isBchDenominated,
    isRightHandedMode,
  } = useSelector((state: ReduxState) => state.settings);

  const availableRawSats = wallet?.balance;
  const isSendDisabled = padBalance === "0";
  const isDisableDecimal =
    padBalance.includes(".") ||
    (isBchDenominated && bitcoinDenomination === "satoshis");

  const inputCurrency = isBchDenominated
    ? bitcoinDenomination
    : contrastCurrency;

  const checkInsufficientBalance = (
    n: string,
    inputCurrency: SupportedCurrencyTypes | BitcoinDenominationTypes
  ): boolean => {
    const proposedBalance = `${padBalance}${n}`;
    const proposedBalanceInSats = convertRawCurrencyToRawSats(
      proposedBalance,
      inputCurrency
    );
    return parseFloat(proposedBalanceInSats) > parseFloat(availableRawSats);
  };

  const isMaxDecimals =
    countDecimalPlaces(padBalance) + 1 > allowedDecimalPlaces(inputCurrency);

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

    if (checkInsufficientBalance(n, inputCurrency)) {
      dispatch(
        updateTransactionPadError({
          error: TRANSACTION_PAD_ERRORS.INSUFFICIENT_BALANCE,
        })
      );
      return;
    }

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

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Send",
      })
    );
  };

  const onPressReceive = () => {
    dispatch(
      updateTransactionPadView({
        view: "Receive",
      })
    );
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

  const SendButton = (
    <Button
      icon={"faPaperPlane"}
      onPress={onPressSend}
      isSmall
      isDisabled={isSendDisabled}
    >
      Send
    </Button>
  );

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.numPad as any}>
        <View style={styles.numPadRow as any}>
          <InputButton
            n={"1"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("1", inputCurrency)
            }
          />
          <InputButton
            n={"2"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("2", inputCurrency)
            }
          />
          <InputButton
            n={"3"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("3", inputCurrency)
            }
          />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton
            n={"4"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("4", inputCurrency)
            }
          />
          <InputButton
            n={"5"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("5", inputCurrency)
            }
          />
          <InputButton
            n={"6"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("6", inputCurrency)
            }
          />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton
            n={"7"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("7", inputCurrency)
            }
          />
          <InputButton
            n={"8"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("8", inputCurrency)
            }
          />
          <InputButton
            n={"9"}
            isDisabled={
              isMaxDecimals || checkInsufficientBalance("9", inputCurrency)
            }
          />
        </View>
        <View style={styles.numPadRow as any}>
          <InputButton n={"<"} />
          <InputButton n={"0"} isDisabled={isMaxDecimals} />
          <InputButton n={"."} isDisabled={isDisableDecimal} />
        </View>
      </View>
      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && SendButton}
        <Button
          icon={"faBitcoinSign"}
          variant="secondary"
          onPress={onPressReceive}
          isSmall
        >
          Receive
        </Button>
        {!isRightHandedMode && SendButton}
      </View>
    </View>
  );
};

export default NumPad;
