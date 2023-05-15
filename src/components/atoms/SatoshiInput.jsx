import { useState, useEffect } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { selectDeviceInfo, selectLocale } from "@/redux/device";
import { bchToSats, satsToBch, DUST_LIMIT, MAX_SATOSHI } from "@/util/sats";

import { Decimal } from "decimal.js";

import CurrencyService from "@/services/CurrencyService";

export default function SatoshiInput({ className, allowFiat, onChange, sats }) {
  const dispatch = useDispatch();

  const preferences = useSelector(selectPreferences);
  const deviceInfo = useSelector(selectDeviceInfo);
  const locale = useSelector(selectLocale);

  const localCurrency = preferences["localCurrency"];
  const preferLocal = preferences["preferLocalCurrency"] === "true";
  const denominateSats = preferences["denominateSats"] === "true";

  const Currency = new CurrencyService(localCurrency);

  function satsToDisplayAmount() {
    return preferLocal
      ? Currency.satsToFiat(sats)
      : denominateSats
      ? sats
      : satsToBch(sats);
  }

  useEffect(
    () => setDisplayAmount(satsToDisplayAmount()),
    [preferences.preferLocalCurrency, preferences.denominateSats]
  );

  const [displayAmount, setDisplayAmount] = useState(
    satsToDisplayAmount().toString()
  );

  const numDecimalPlaces = (num) => {
    const split = num.split(".");
    const major = split[0];
    const minor = split.length > 1 ? split[1] : "";

    return minor.length;
  };

  const handleInputChange = (amount, sats) => {
    if (new Decimal(sats).greaterThan(MAX_SATOSHI)) {
      setDisplayAmount(displayAmount);
      return;
    }

    if (new Decimal(sats).lessThan(0)) {
      setDisplayAmount("0");
      return;
    }

    setDisplayAmount(amount);
    onChange(sats);
  };

  const handleKeyDown = (event) => {
    if (deviceInfo.platform !== "web" && event.key === "Enter") {
      Keyboard.hide();
    }
  };

  const currencySymbol = preferLocal ? Currency.getSymbol(localCurrency) : "₿";
  const currency = preferLocal
    ? localCurrency
    : denominateSats
    ? "sats"
    : "BCH";

  const handleClickCurrency = () => {
    if (!preferLocal) {
      dispatch(
        setPreference({ key: "denominateSats", value: !denominateSats })
      );
    }
  };

  return (
    <div className="flex items-center">
      <>
        <div className="text-xl px-0.5 font-mono font-semibold">
          {currencySymbol}
        </div>
        <input
          type="text"
          inputMode="numeric"
          className={className}
          value={displayAmount}
          onChange={(event) => {
            const maxDecimals = preferLocal ? 2 : denominateSats ? 0 : 8;

            const value =
              event.target.value === "."
                ? "0."
                : !event.target.value
                ? "0"
                : event.target.value;

            const amount = new Decimal(Number.parseFloat(value)).toFixed(
              Math.min(numDecimalPlaces(value), maxDecimals),
              Decimal.ROUND_DOWN
            );

            const sats = preferLocal
              ? Currency.fiatToSats(amount)
              : denominateSats
              ? amount
              : bchToSats(amount);

            const hasEndDecimal =
              (preferLocal || (!preferLocal && !denominateSats)) &&
              (value === "0." ||
                (!displayAmount.toString().includes(".") &&
                  value.endsWith(".") &&
                  value.length > 1));

            handleInputChange(`${amount}${hasEndDecimal ? "." : ""}`, sats);
          }}
          onKeyDown={handleKeyDown}
        />
        <div
          className="text-base px-0.5 font-mono font-semibold"
          onClick={handleClickCurrency}
        >
          {currency}
        </div>
      </>
    </div>
  );
}
