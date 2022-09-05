import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@types";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ONE_SECOND, THIRTY_SECONDS } from "@utils/consts";
import emit from "@utils/emit";
import axios from "axios";
import { updateBchPrices } from "@redux/reducers/exchangeRatesReducer";
import { selectActiveWallet, selectIsActiveWallet } from "@redux/selectors";

const BackgroundIntervals = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));

  const isWallet = useSelector((state: ReduxState) =>
    selectIsActiveWallet(state)
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

    if (wallet) {
      fetchActiveWalletBalance();
    }
    fetchPriceData();
  };

  // Create a wallet if none exists
  // I.e. first time app is opened
  if (!isWallet) {
    // Add 1 second delay to allow internet connection time
    // to load and reduce No Connection errors
    setTimeout(() => {
      setInterval(() => {
        // console.log("triggering create wallet stuff");
        // console.log({ isNoWallet });
        // if (!isNoWallet) {
        //   return;
        // }
        emit({
          type: BRIDGE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET,
          data: { isTestNet },
        });
      }, ONE_SECOND * 3);
    }, ONE_SECOND);
  }

  // Recheck balance when active wallet changes
  // Including importing a new wallet
  useEffect(() => {
    if (!wallet) {
      return;
    }

    // Add 1 second delay to allow internet connection time
    // to load and reduce No Connection errors
    setTimeout(() => {
      fetchActiveWalletBalance();
    }, ONE_SECOND);
  }, [wallet]);

  // Run regular checks every 30s
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
