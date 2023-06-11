import { useEffect, useState, useMemo } from "react";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectExchangeRates } from "@/redux/exchangeRates";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { EyeInvisibleOutlined } from "@ant-design/icons";

import { animated, useSpring } from "@react-spring/web";
import { formatSatoshis } from "@/util/sats";
import { translate, translations } from "@/util/translations";

const { availableBalance } = translations.views.walletView.WalletViewBalance;

export default function WalletViewBalance() {
  const [firstRender, setFirstRender] = useState(true);
  const { balance } = useSelector(selectActiveWallet);
  const exchangeRates = useSelector(selectExchangeRates);
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  const hideBalance = preferences["hideAvailableBalance"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const dispatch = useDispatch();

  const handleHideBalance = () => {
    dispatch(
      setPreference({ key: "hideAvailableBalance", value: !hideBalance })
    );
  };

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({ key: "preferLocalCurrency", value: !preferLocal })
    );
  };

  const [balanceReceivedSpring, receiveSpringApi] = useSpring(() => ({
    from: { color: "#8dc451" },
    to: { color: "#e4e4e7" },
    immediate: true, //strangely, it stops the immediate animation when true, not false.
    config: {
      tension: 270,
      friction: 112,
    },
  }));

  useEffect(
    function animateWalletBalanceOnReceive() {
      if (!firstRender) {
        receiveSpringApi.start({ reset: true });
      }

      setFirstRender(false);
    },
    [balance]
  );

  const formattedBalance = useMemo(
    () => formatSatoshis(balance),
    [exchangeRates, balance, preferences]
  );

  return (
    <div className="py-3 text-center">
      {!hideBalance && (
        <div className="font-bold text-zinc-400 text-md tracking-wide">
          {translate(availableBalance, preferencesLanguageCode)}
        </div>
      )}
      <div className="text-2xl text-zinc-200 tabular-nums">
        <span onClick={handleHideBalance} className="cursor-pointer">
          {hideBalance && (
            <EyeInvisibleOutlined className="text-zinc-400 opacity-60 px-1" />
          )}
          &nbsp;
          <span
            className={`${
              hideBalance ? "blur-sm backdrop-opacity-60 opacity-25" : ""
            }`}
          >
            <animated.span style={{ ...balanceReceivedSpring }}>
              {formattedBalance[preferLocal ? "fiat" : "bch"]}
            </animated.span>
          </span>
        </span>
      </div>
      {!hideBalance && (
        <div className="text-md text-zinc-400 cursor-pointer">
          <span onClick={handleFlipCurrency}>
            {formattedBalance[preferLocal ? "bch" : "fiat"]}
          </span>
        </div>
      )}
    </div>
  );
}
