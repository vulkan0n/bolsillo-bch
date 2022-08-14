import React, { useEffect } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "../../types";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";
import { TEN_SECONDS } from "../../utils/consts";
import emit from "../../utils/emit";
import axios from "axios";

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

  const fetchPriceData = async () => {
    console.log("fetching price data");
    // https://www.coingecko.com/en/api/documentation
    const coingeckoUrl = "https://api.coingecko.com";
    const BCH_ID = 1542;

    // Passing configuration object to axios
    const res = await axios({
      method: "get",
      url: `${coingeckoUrl}/api/v3/coins/bitcoin-cash`,
    });

    // console.log({ res });
    const usdPrice = res?.data?.market_data?.current_price?.usd;
    console.log({ usdPrice });
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
