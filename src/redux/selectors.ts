import { createSelector } from "@reduxjs/toolkit";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SeleneWalletType,
  SupportedCurrencyTypes,
} from "../types";
import { convertBalanceToDisplay } from "../utils/formatting";

export const selectActiveWallet = createSelector(
  (state: ReduxState): SeleneWalletType[] => state.walletManager?.wallets,
  (state: ReduxState): string => state.walletManager?.activeWalletName,
  (wallets: SeleneWalletType[], activeWalletName: string): SeleneWalletType =>
    wallets?.find(({ name }) => name === activeWalletName)
);

export const selectActiveWalletIsZeroBalance = createSelector(
  selectActiveWallet,
  (wallet: SeleneWalletType): boolean => parseInt(wallet?.balance) === 0
);

export const selectActiveWalletBalance = createSelector(
  selectActiveWallet,
  (state: ReduxState): Boolean => state.settings.isBchDenominated,
  (state: ReduxState): BitcoinDenominationTypes =>
    state.settings.bitcoinDenomination,
  (state: ReduxState): SupportedCurrencyTypes =>
    state.settings.contrastCurrency,
  (
    activeWallet: SeleneWalletType,
    isBchDenominated: Boolean,
    bitcoinDenomination: BitcoinDenominationTypes,
    contrastCurrency: SupportedCurrencyTypes
  ): {
    primaryBalance: String;
    secondaryBalance: String;
  } => {
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
