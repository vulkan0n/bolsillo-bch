import { createSelector } from "@reduxjs/toolkit";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SeleneWalletType,
  SupportedCurrencyTypes,
} from "@types";
import {
  convertBalanceToDisplay,
  convertRawCurrencyToRawSats,
  prettifyPadBalance,
} from "@utils/formatting";
import { CurrencyOrDenominationType } from "../types";

interface ActiveWalletBalance {
  primaryBalance: string;
  secondaryBalance: string;
  availableSats: string;
}

export const selectActiveWallet: (state: ReduxState) => SeleneWalletType =
  createSelector(
    (state: ReduxState): SeleneWalletType[] => state.walletManager?.wallets,
    (state: ReduxState): string => state.walletManager?.activeWalletName,
    (wallets: SeleneWalletType[], activeWalletName: string): SeleneWalletType =>
      wallets?.find(({ name }) => name === activeWalletName)
  );

export const selectIsActiveWallet: (state: ReduxState) => SeleneWalletType =
  createSelector(
    selectActiveWallet,
    (activeWallet: SeleneWalletType[]): Boolean => !!activeWallet
  );

export const selectIsActiveWalletZeroBalance: (state: ReduxState) => boolean =
  createSelector(
    selectActiveWallet,
    (wallet: SeleneWalletType): boolean => parseInt(wallet?.balance) === 0
  );

export const selectActiveWalletBalance: (
  state: ReduxState
) => ActiveWalletBalance = createSelector(
  selectActiveWallet,
  (state: ReduxState): boolean => state.settings.isBchDenominated,
  (state: ReduxState): BitcoinDenominationTypes =>
    state.settings.bitcoinDenomination,
  (state: ReduxState): SupportedCurrencyTypes =>
    state.settings.contrastCurrency,
  (
    activeWallet: SeleneWalletType,
    isBchDenominated: boolean,
    bitcoinDenomination: BitcoinDenominationTypes,
    contrastCurrency: SupportedCurrencyTypes
  ): ActiveWalletBalance => {
    const bchBalance = convertBalanceToDisplay(
      activeWallet?.balance,
      "satoshis",
      bitcoinDenomination
    );

    const contrastBalance = convertBalanceToDisplay(
      activeWallet?.balance,
      "satoshis",
      contrastCurrency
    );

    const primaryBalance = isBchDenominated ? bchBalance : contrastBalance;
    const secondaryBalance = isBchDenominated ? contrastBalance : bchBalance;
    const availableRawSats = activeWallet?.balance?.toString();

    return {
      primaryBalance,
      secondaryBalance,
      availableRawSats,
    };
  }
);

export const selectPrimaryCurrencyOrDenomination: (
  state: ReduxState
) => CurrencyOrDenominationType = createSelector(
  (state: ReduxState): boolean => state.settings.isBchDenominated,
  (state: ReduxState): BitcoinDenominationTypes =>
    state.settings.bitcoinDenomination,
  (state: ReduxState): SupportedCurrencyTypes =>
    state.settings.contrastCurrency,
  (
    isBchDenominated: boolean,
    bitcoinDenomination: BitcoinDenominationTypes,
    contrastCurrency: SupportedCurrencyTypes
  ): CurrencyOrDenominationType =>
    isBchDenominated ? bitcoinDenomination : contrastCurrency
);

export const selectSecondaryCurrencyOrDenomination: (
  state: ReduxState
) => CurrencyOrDenominationType = createSelector(
  (state: ReduxState): boolean => state.settings.isBchDenominated,
  (state: ReduxState): BitcoinDenominationTypes =>
    state.settings.bitcoinDenomination,
  (state: ReduxState): SupportedCurrencyTypes =>
    state.settings.contrastCurrency,
  (
    isBchDenominated: boolean,
    bitcoinDenomination: BitcoinDenominationTypes,
    contrastCurrency: SupportedCurrencyTypes
  ): CurrencyOrDenominationType =>
    isBchDenominated ? contrastCurrency : bitcoinDenomination
);

export const selectPadBalanceInRawSats: (state: ReduxState) => string =
  createSelector(
    (state: ReduxState): boolean => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    (padBalance, primaryCurrency) =>
      convertRawCurrencyToRawSats(padBalance, primaryCurrency)
  );

export const selectPadPrimaryBalance: (state: ReduxState) => string =
  createSelector(
    (state: ReduxState): boolean => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    (padBalance, primaryCurrency) =>
      prettifyPadBalance(padBalance, primaryCurrency)
  );

export const selectPadSecondaryBalance: (state: ReduxState) => string =
  createSelector(
    (state: ReduxState): boolean => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    selectSecondaryCurrencyOrDenomination,
    (padBalance, primaryCurrency, secondaryCurrency) =>
      convertBalanceToDisplay(padBalance, primaryCurrency, secondaryCurrency)
  );

export const selectIsPadZeroBalance: (state: ReduxState) => boolean =
  createSelector(selectPadBalanceInRawSats, (padBalance) => padBalance === "0");
