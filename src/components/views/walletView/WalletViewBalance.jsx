import { useEffect, useMemo } from "react";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectExchangeRates } from "@/redux/exchangeRates";
import { selectPreferences, setPreference } from "@/redux/preferences";

import { animated, useSpring } from "@react-spring/web";
import { formatSatoshis } from "@/util/sats";

import CurrencyFlip from "@/components/atoms/CurrencyFlip";
import { EyeInvisibleOutlined } from "@ant-design/icons";

export default function WalletViewBalance() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const { name: activeWalletName, balance } = useSelector(selectActiveWallet);
  const exchangeRates = useSelector(selectExchangeRates);

  const hideBalance = preferences["hideAvailableBalance"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({ key: "preferLocalCurrency", value: !preferLocal })
    );
  };

  const handleHideBalance = () => {
    dispatch(
      setPreference({ key: "hideAvailableBalance", value: !hideBalance })
    );
  };

  const hiddenBalanceClasses =
    hideBalance && "blur-sm backdrop-opacity-60 opacity-25";

  const [balanceReceivedSpring, receiveSpringApi] = useSpring(() => ({
    from: { color: "#8dc451" },
    to: { color: "#e4e4e7" },
    immediate: true,
    config: {
      tension: 230,
      friction: 100,
      mass: 0.6,
    },
  }));

  useEffect(
    function animateWalletBalanceOnReceive() {
      receiveSpringApi.start({ reset: true });
    },
    [balance]
  );

  const formattedBalance = useMemo(
    () => formatSatoshis(balance),
    [exchangeRates, balance, preferences]
  );

  return (
    <div className="py-2.5 text-center">
      <div
        className={`font-bold text-zinc-400 text-md tracking-wide ${hiddenBalanceClasses}`}
      >
        {activeWalletName}
      </div>
      <div
        className={`cursor-pointer ${hiddenBalanceClasses}`}
        onClick={hideBalance ? handleHideBalance : handleFlipCurrency}
      >
        <div className="text-2xl text-zinc-200 tabular-nums">
          <animated.span style={{ ...balanceReceivedSpring }}>
            {formattedBalance[preferLocal ? "fiat" : "bch"]}
          </animated.span>
        </div>

        <div className="text-md text-zinc-400 flex items-center justify-center">
          {formattedBalance[preferLocal ? "bch" : "fiat"]}
          <CurrencyFlip className="ml-1" />
        </div>
      </div>
    </div>
  );
}
