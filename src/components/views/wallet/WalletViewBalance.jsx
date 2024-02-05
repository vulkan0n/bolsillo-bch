import { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { StockOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import {
  setPreference,
  selectCurrencySettings,
  selectIsChipnet,
} from "@/redux/preferences";
import { selectCurrentPrice } from "@/redux/exchangeRates";

import Satoshi from "@/atoms/Satoshi";
import CurrencyFlip from "@/atoms/CurrencyFlip";

export default function WalletViewBalance() {
  const dispatch = useDispatch();
  const { name: activeWalletName, balance } = useSelector(selectActiveWallet);
  const price = useSelector(selectCurrentPrice);
  const isChipnet = useSelector(selectIsChipnet);

  const {
    shouldPreferLocalCurrency,
    shouldHideBalance,
    shouldDisplayExchangeRate,
  } = useSelector(selectCurrencySettings);

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );
  };

  const handleHideBalance = () => {
    dispatch(
      setPreference({
        key: "hideAvailableBalance",
        value: shouldHideBalance ? "false" : "true",
      })
    );
  };

  const hiddenBalanceClasses =
    shouldHideBalance && "blur-sm backdrop-opacity-60 opacity-25";

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
    [balance, receiveSpringApi]
  );

  return (
    <div className="py-2.5 text-center">
      <div
        className={`font-bold text-zinc-400 text-md tracking-wide ${hiddenBalanceClasses}`}
      >
        {isChipnet ? "[CHIP] " : ""}
        {activeWalletName}
      </div>
      <button
        type="button"
        className={`cursor-pointer ${hiddenBalanceClasses}`}
        onClick={shouldHideBalance ? handleHideBalance : handleFlipCurrency}
      >
        <div className="text-2xl text-zinc-200 tabular-nums">
          <animated.span style={{ ...balanceReceivedSpring }}>
            <Satoshi value={balance} />
          </animated.span>
        </div>

        <div className="text-md text-zinc-400 flex items-center justify-center">
          <Satoshi value={balance} flip />
          <CurrencyFlip className="ml-1" />
        </div>
      </button>
      {shouldDisplayExchangeRate && (
        <div className="text-md text-zinc-400/80 mt-0.5">
          <StockOutlined className="mr-1" />
          {price.priceString}
          <span className="mx-0.5 text-sm font-mono">/</span>BCH
        </div>
      )}
    </div>
  );
}
