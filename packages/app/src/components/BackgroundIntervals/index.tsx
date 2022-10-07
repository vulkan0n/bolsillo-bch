import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import {
  ONE_SECOND,
  THIRTY_SECONDS,
} from "@selene-wallet/common/dist/utils/consts";
import emit from "@selene-wallet/app/src/utils/emit";
import axios from "axios";
import { updateBchPrices } from "@selene-wallet/app/src/redux/reducers/exchangeRatesReducer";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { gql, useMutation } from "@apollo/client";
import { dailyCheckIn } from "./utils";

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($period: String!, $date: String!) {
    sendCheckIn(period: $period, date: $date) {
      status
    }
  }
`;

const BackgroundIntervals = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);
  const lastDailyCheckIn = useSelector(
    (state: ReduxState) => state.local.lastDailyCheckIn
  );

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const [sendCheckIn] = useMutation(SEND_DAILY_CHECK_IN);

  const fetchWalletHistories = () => {
    wallets.map(({ name, mnemonic, derivationPath }) => {
      emit({
        type: BRIDGE_MESSAGE_TYPES.GET_WALLET_HISTORY,
        data: {
          name,
          mnemonic,
          derivationPath,
          isTestNet,
        },
      });
    });
  };

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

  const checkIn = () => {
    console.log("checking in!");
    dailyCheckIn({ lastDailyCheckIn, dispatch, sendCheckIn });
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

    if (wallets) {
      fetchWalletHistories();
    }

    fetchPriceData();
    checkIn();
  };

  // Recheck balance when active wallet changes
  // Including importing a new wallet
  // Add 1 second delay to allow internet connection time
  // to load and reduce No Connection errors
  useEffect(() => {
    if (!wallet) {
      return;
    }

    setTimeout(() => {
      fetchActiveWalletBalance();
    }, ONE_SECOND);
  }, [wallet]);

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
