import { createSelector } from "@reduxjs/toolkit";
import { convertBalanceToDisplay } from "../utils/formatting";

export const selectActiveWallet = createSelector(
  (state) => state.walletManager?.wallets,
  (state) => state.walletManager?.activeWalletName,
  (wallets, activeWalletName) =>
    wallets?.find(({ name }) => name === activeWalletName)
);

export const selectActiveWalletIsZeroBalance = createSelector(
  selectActiveWallet,
  (wallet) => parseInt(wallet?.balance) === 0
);

export const selectActiveWalletBalance = createSelector(
  selectActiveWallet,
  (state) => state.settings.isBchDenominated,
  (state) => state.settings.bitcoinDenomination,
  (state) => state.settings.contrastCurrency,
  (wallet, isBchDenominated, bitcoinDenomination, contrastCurrency) => {
    const bchBalance = convertBalanceToDisplay(
      wallet?.balance,
      "satoshis",
      bitcoinDenomination
    );

    const contrastBalance = convertBalanceToDisplay(
      wallet?.balance,
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
