import store from "../redux/store";
import { ReduxState } from "../types";
import { convertBalanceToDisplay } from "../utils/formatting";

const useActiveWalletBalance = () => {
  const state = store.getState();
  const wallet = state.walletManager?.wallets?.find(
    ({ name }) => name === state.walletManager?.activeWalletName
  );

  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    state.settings;

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
    bchBalance,
    contrastBalance,
    primaryBalance,
    secondaryBalance,
  };
};

export default useActiveWalletBalance;
