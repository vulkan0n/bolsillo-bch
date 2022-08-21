import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../types";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";
import { THIRTY_SECONDS } from "../../utils/consts";
import emit from "../../utils/emit";
import axios from "axios";
import { updateBchPrices } from "../../redux/reducers/exchangeRatesReducer";

const BackgroundIntervals = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) =>
    state.walletManager?.wallets?.find(({ name }) => {
      console.log({ state });
      return name === state.walletManager?.activeWalletName;
    })
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const fetchActiveWalletBalance = () => {
    console.log("emitting fetchActiveWalletBaslance", {
      wallet,
      isTestNet,
    });
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

    const currentPrices = res?.data?.market_data?.current_price;

    const audBchPrice = currentPrices?.aud;
    const btcBchPrice = currentPrices?.btc;
    const cadBchPrice = currentPrices?.cad;
    const cnyBchPrice = currentPrices?.cny;
    const ethBchPrice = currentPrices?.eth;
    const eurBchPrice = currentPrices?.eur;
    const gbpBchPrice = currentPrices?.gbp;
    const jpyBchPrice = currentPrices?.jpy;
    const phpBchPrice = currentPrices?.php;
    const rubBchPrice = currentPrices?.rub;
    const thbBchPrice = currentPrices?.thb;
    const usdBchPrice = currentPrices?.usd;

    dispatch(
      updateBchPrices({
        audBchPrice,
        btcBchPrice,
        cadBchPrice,
        cnyBchPrice,
        ethBchPrice,
        eurBchPrice,
        gbpBchPrice,
        jpyBchPrice,
        phpBchPrice,
        rubBchPrice,
        thbBchPrice,
        usdBchPrice,
      })
    );
  };

  const ping = () => {
    // console.log("ping!");
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
