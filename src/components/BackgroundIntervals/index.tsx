import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../types";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";
import { THIRTY_SECONDS } from "../../utils/consts";
import emit from "../../utils/emit";
import axios from "axios";
import { updateBchUsdPrice } from "../../redux/reducers/exchangeRatesReducer";

const BackgroundIntervals = () => {
  const dispatch = useDispatch();
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
    // https://www.coingecko.com/en/api/documentation
    const coingeckoUrl = "https://api.coingecko.com";

    const res = await axios({
      method: "get",
      url: `${coingeckoUrl}/api/v3/coins/bitcoin-cash`,
    });

    const bchUsdPrice = res?.data?.market_data?.current_price?.usd;

    dispatch(
      updateBchUsdPrice({
        bchUsdPrice,
      })
    );
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
    }, THIRTY_SECONDS);

    return () => clearInterval(interval);
  }, []);

  return <View />;
};

export default BackgroundIntervals;
