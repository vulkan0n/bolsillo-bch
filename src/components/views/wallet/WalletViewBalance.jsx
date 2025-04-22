import { useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import { animated, useSpring } from "@react-spring/web";
import { StockOutlined, SettingFilled, WarningFilled } from "@ant-design/icons";
import {
  selectActiveWalletHash,
  selectActiveWalletName,
  selectActiveWalletBalance,
  selectKeyViewedAt,
} from "@/redux/wallet";
import {
  setPreference,
  selectBchNetwork,
  selectShouldDisplayExchangeRate,
  selectShouldHideBalance,
} from "@/redux/preferences";
import { selectCurrentPriceString } from "@/redux/exchangeRates";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import Satoshi from "@/atoms/Satoshi";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";

export default function WalletViewBalance() {
  const dispatch = useDispatch();

  const walletHash = useSelector(selectActiveWalletHash);
  const activeWalletName = useSelector(selectActiveWalletName);
  const balance = useSelector(selectActiveWalletBalance);
  const key_viewed_at = useSelector(selectKeyViewedAt);

  const priceString = useSelector(selectCurrentPriceString);
  const bchNetwork = useSelector(selectBchNetwork);

  const isKeyViewed = key_viewed_at !== null;

  const handleFlipCurrency = useCurrencyFlip();

  const shouldDisplayExchangeRate = useSelector(
    selectShouldDisplayExchangeRate
  );

  const shouldHideBalance = useSelector(selectShouldHideBalance);

  const handleHideBalance = useCallback(async () => {
    if (shouldHideBalance === true) {
      const isAuthorized = await SecurityService().authorize(
        AuthActions.RevealBalance
      );

      if (!isAuthorized) {
        return;
      }
    }

    dispatch(
      setPreference({
        key: "hideAvailableBalance",
        value: shouldHideBalance ? "false" : "true",
      })
    );
  }, [dispatch, shouldHideBalance]);

  const hiddenBalanceClasses = useMemo(
    () => (shouldHideBalance ? "blur-sm backdrop-opacity-60 opacity-25" : ""),
    [shouldHideBalance]
  );

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
    <div className="py-2.5 text-center flex flex-col justify-center items-center">
      <div className="font-bold text-neutral-400 text-md tracking-wide">
        <Link
          to={`/settings/wallet/${walletHash}`}
          className={`flex justify-center items-center ${!isKeyViewed && "text-warning"}`}
        >
          {bchNetwork === "chipnet" && "[CHIP] "}
          {bchNetwork === "testnet3" && "[TEST3] "}
          {bchNetwork === "testnet4" && "[TEST4] "}
          {activeWalletName}{" "}
          {!isKeyViewed && balance > 0 ? (
            <WarningFilled className="text-xs ml-1 text-warning" />
          ) : (
            <SettingFilled className="text-xs ml-1 text-primary/70" />
          )}
        </Link>
      </div>
      <button
        type="button"
        className={`cursor-pointer ${hiddenBalanceClasses}`}
        onClick={shouldHideBalance ? handleHideBalance : handleFlipCurrency}
      >
        <div className="text-2xl text-neutral-200 tabular-nums flex justify-center items-center">
          <animated.span style={{ ...balanceReceivedSpring }}>
            <Satoshi value={balance} />
          </animated.span>
        </div>

        <div className="text-md text-neutral-400 flex items-center justify-center">
          <Satoshi value={balance} flip />
          <CurrencyFlip className="ml-1" />
        </div>
      </button>
      {shouldDisplayExchangeRate && (
        <div className="text-sm text-neutral-400/80 mt-0.5 flex justify-center items-center font-mono">
          <StockOutlined className="mr-1" />
          {priceString}
          <span className="mx-0.5 text-sm font-mono">/</span>BCH
        </div>
      )}
    </div>
  );
}
