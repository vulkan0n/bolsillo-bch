import { createSelector } from "@reduxjs/toolkit";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SeleneWalletType,
  SupportedCurrencyTypes,
} from "@types";
import { convertBalanceToDisplay } from "@utils/formatting";
import { CurrencyOrDenominationType } from "../types";

interface ActiveWalletBalance {
  primaryBalance: string;
  secondaryBalance: string;
}

export const selectActiveWallet: (state: ReduxState) => SeleneWalletType =
  createSelector(
    (state: ReduxState): SeleneWalletType[] => state.walletManager?.wallets,
    (state: ReduxState): string => state.walletManager?.activeWalletName,
    (wallets: SeleneWalletType[], activeWalletName: string): SeleneWalletType =>
      wallets?.find(({ name }) => name === activeWalletName)
  );

export const selectActiveWalletIsZeroBalance: (state: ReduxState) => boolean =
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

    return {
      primaryBalance,
      secondaryBalance,
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
