import React, { useEffect } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "../../types";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";
import { TEN_SECONDS } from "../../utils/consts";
import emit from "../../utils/emit";

const BackgroundIntervals = () => {
  const wallet = useSelector((state: ReduxState) =>
    state.walletManager?.wallets?.find(
      ({ name }) => name === state.walletManager?.activeWalletName
    )
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const fetchActiveWalletBalance = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE_AND_ADDRESS,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        isTestNet,
      },
    });
  };

  const fetchPriceData = () => {
    console.log("fetching price data");
  };

  const ping = () => {
    console.log("ping!");
    fetchActiveWalletBalance();
    fetchPriceData();
  };

  useEffect(() => {
    ping();

    const interval = setInterval(() => {
      ping();
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, []);

  return <View />;
};

export default BackgroundIntervals;
