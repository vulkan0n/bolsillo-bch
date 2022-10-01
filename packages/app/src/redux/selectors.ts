import { createSelector } from "@reduxjs/toolkit";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SeleneWalletType,
  SupportedCurrencyTypes,
} from "@selene/common/dist/types";
import {
  convertBalanceToDisplay,
  convertRawCurrencyToRawSats,
  prettifyPadBalance,
} from "@selene/app/src/utils/formatting";
import { CurrencyOrDenominationType } from "@selene/common/dist/types";
import { BITCOIN_DENOMINATIONS } from "@selene/app/src/utils/consts";

interface ActiveWalletBalance {
  primaryBalance: string;
  secondaryBalance: string;
  availableRawSats: string;
}

export const selectActiveWallet: (state: ReduxState) => SeleneWalletType =
  createSelector(
    (state: ReduxState): SeleneWalletType[] => state.walletManager?.wallets,
    (state: ReduxState): string => state.walletManager?.activeWalletName,
    (wallets: SeleneWalletType[], activeWalletName: string): SeleneWalletType =>
      wallets?.find(({ name }) => name === activeWalletName)
  );

export const selectIsActiveWallet: (state: ReduxState) => Boolean =
  createSelector(
    selectActiveWallet,
    (activeWallet: SeleneWalletType): boolean => !!activeWallet
  );

export const selectIsActiveWalletZeroBalance: (state: ReduxState) => Boolean =
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
      BITCOIN_DENOMINATIONS.satoshis,
      bitcoinDenomination
    );

    const contrastBalance = convertBalanceToDisplay(
      activeWallet?.balance,
      BITCOIN_DENOMINATIONS.satoshis,
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
    (state: ReduxState): string => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    (padBalance, primaryCurrency) =>
      convertRawCurrencyToRawSats(padBalance, primaryCurrency)
  );

export const selectPadPrimaryBalance: (state: ReduxState) => string =
  createSelector(
    (state: ReduxState): string => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    (padBalance, primaryCurrency) =>
      prettifyPadBalance(padBalance, primaryCurrency)
  );

export const selectPadSecondaryBalance: (state: ReduxState) => string =
  createSelector(
    (state: ReduxState): string => state.transactionPad.padBalance,
    selectPrimaryCurrencyOrDenomination,
    selectSecondaryCurrencyOrDenomination,
    (padBalance, primaryCurrency, secondaryCurrency) =>
      convertBalanceToDisplay(padBalance, primaryCurrency, secondaryCurrency)
  );

export const selectIsPadZeroBalance: (state: ReduxState) => boolean =
  createSelector(selectPadBalanceInRawSats, (padBalance) => padBalance === "0");
