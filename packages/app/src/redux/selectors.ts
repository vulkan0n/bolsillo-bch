import { createSelector } from "@reduxjs/toolkit";
import {
  BitcoinDenominationTypes,
  ReduxState,
  SeleneWalletType,
  SupportedCurrencyTypes,
} from "@selene-wallet/common/dist/types";
import {
  convertBalanceToDisplay,
  convertRawCurrencyToRawSats,
  prettifyPadBalance,
} from "@selene-wallet/app/src/utils/formatting";
import { getWalletSatoshiBalance } from "@selene-wallet/app/src/utils/wallet";

import { CurrencyOrDenominationType } from "@selene-wallet/common/dist/types";
import {
  BITCOIN_DENOMINATIONS,
  MINIMUM_SPENDABLE_SATOSHIS,
} from "@selene-wallet/common/dist/utils/consts";

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
    (wallet: SeleneWalletType): boolean =>
      parseInt(getWalletSatoshiBalance(wallet)) === 0
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
    const activeWalletBalance = getWalletSatoshiBalance(activeWallet);

    const bchBalance = convertBalanceToDisplay(
      activeWalletBalance,
      BITCOIN_DENOMINATIONS.satoshis,
      bitcoinDenomination
    );

    const contrastBalance = convertBalanceToDisplay(
      activeWalletBalance,
      BITCOIN_DENOMINATIONS.satoshis,
      contrastCurrency
    );

    const primaryBalance = isBchDenominated ? bchBalance : contrastBalance;
    const secondaryBalance = isBchDenominated ? contrastBalance : bchBalance;

    return {
      primaryBalance,
      secondaryBalance,
      availableRawSats: activeWalletBalance,
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

export const selectIsPadBelowMinimumSpendableBalance: (
  state: ReduxState
) => boolean = createSelector(
  selectPadBalanceInRawSats,
  (padBalance) => parseInt(padBalance) < MINIMUM_SPENDABLE_SATOSHIS
);
