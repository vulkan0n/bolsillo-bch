import axios from "axios";
import { updateBchPrices } from "@selene-wallet/app/src/redux/reducers/exchangeRatesReducer";
import store from "@selene-wallet/app/src/redux/store";

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

  store.dispatch(
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

export default fetchPriceData;
