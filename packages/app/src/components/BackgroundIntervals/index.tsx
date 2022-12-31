import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState, SeleneWalletType } from "@selene-wallet/common/dist/types";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import {
  ONE_SECOND,
  THIRTY_SECONDS,
} from "@selene-wallet/common/dist/utils/consts";
import emit from "@selene-wallet/app/src/utils/emit";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import fetchPriceData from "./fetchPriceData";
import checkIn from "./checkIn";

export const scanAddressAtIndex = (
  wallet: SeleneWalletType,
  hdWalletIndex: number,
  isTestNet: boolean
) => {
  emit({
    type: BRIDGE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX,
    data: {
      name: wallet?.name,
      mnemonic: wallet?.mnemonic,
      derivationPath: wallet?.derivationPath,
      hdWalletIndex,
      isTestNet,
    },
  });
};

export const fetchActiveWalletBalance = (
  wallet: SeleneWalletType,
  isTestNet: boolean
) => {
  // console.log("fetchActiveWalletBalance");
  // console.log({ wallet });
  emit({
    type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS,
    data: {
      name: wallet?.name,
      mnemonic: wallet?.mnemonic,
      derivationPath: wallet?.derivationPath,
      maxAddressIndex: wallet?.maxAddressIndex,
      isTestNet,
    },
  });
};

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

    if (wallet) {
      fetchActiveWalletBalance(wallet, isTestNet);
    }

    if (wallets) {
      console.log("fetching Wallet histories");
      fetchWalletHistories();
    }

    fetchPriceData();
    checkIn();
  };

  // Recheck balance when active wallet changes
  // Including importing a new wallet
  // Add 1 second delay to allow internet connection time
  // to load and reduce No Connection errors
  // useEffect(() => {
  //   if (!wallet) {
  //     return;
  //   }

  //   setTimeout(() => {
  //     fetchActiveWalletBalance();
  //   }, ONE_SECOND);
  // }, [wallet]);

  // Run regular checks every 30s
  useEffect(() => {
    // Clear any temporary variables from last session
    // When app loads
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

  return <View />;
};

export default BackgroundIntervals;
