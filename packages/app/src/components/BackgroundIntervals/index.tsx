import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { getWalletDepositAddress } from "@selene-wallet/app/src/utils/wallet/index";
import {
  ONE_SECOND,
  THIRTY_SECONDS,
} from "@selene-wallet/common/dist/utils/consts";
import emit from "@selene-wallet/app/src/utils/emit";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import fetchPriceData from "./fetchPriceData";
import checkIn from "./checkIn";
import {
  checkWalletExistingAddresses,
  scanDepositAddress,
} from "@selene-wallet/app/src/utils/wallet";

const BackgroundIntervals = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const fetchWalletHistories = () => {
    wallets.map(({ name, mnemonic, derivationPath, maxAddressIndex }) => {
      emit({
        type: BRIDGE_MESSAGE_TYPES.GET_WALLET_HISTORY,
        data: {
          name,
          mnemonic,
          derivationPath,
          maxAddressIndex,
          isTestNet,
        },
      });
    });
  };

  const ping = () => {
    // console.log("ping!");

    if (wallets) {
      console.log("fetching Wallet histories");
      fetchWalletHistories();
    }

    fetchPriceData();
    checkIn();
  };

  // Recheck addresses when active wallet changes
  // Updates balance and transaction histories if any missed
  // Including importing a new wallet
  // Add 1 second delay to allow internet connection time
  // to load and reduce No Connection errors
  useEffect(() => {
    if (!wallet) {
      return;
    }

    setTimeout(() => {
      checkWalletExistingAddresses(wallet, isTestNet);
    }, ONE_SECOND);
  }, [wallet?.name]);

  // Run regular checks every 30s
  useEffect(() => {
    // Clear any temporary variables from last session
    // when app loads
    dispatch(
      updateTransactionPadIsSendingCoins({
        isSendingCoins: false,
      })
    );

    ping();

    const interval = setInterval(() => {
      ping();
    }, THIRTY_SECONDS);

    return () => clearInterval(interval);
  }, []);

  const depostAddress = getWalletDepositAddress(wallet);
  // Scan deposit address for incoming transactions every second
  // TODO: Replace with the watcher methods in mainnet?
  // Would this make it less reliable, on the other side of the bridge?
  useEffect(() => {
    const interval = setInterval(() => {
      scanDepositAddress(wallet);
    }, ONE_SECOND * 3);

    return () => clearInterval(interval);
  }, [depostAddress]);

  return <View />;
};

export default BackgroundIntervals;
