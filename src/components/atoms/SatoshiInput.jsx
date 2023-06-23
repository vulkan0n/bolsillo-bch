import { useState, useEffect } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPreferences,
  setPreference,
  selectLocalCurrency,
} from "@/redux/preferences";
import { selectDeviceInfo, selectLocale } from "@/redux/device";
import {
  bchToSats,
  satsToBch,
  MAX_SATOSHI,
  satsToDisplayAmount,
} from "@/util/sats";

import { Decimal } from "decimal.js";

import CurrencyService from "@/services/CurrencyService";

export default function SatoshiInput({
  className,
  satoshiInput,
  onChange,
  size = 20,
}) {
  const dispatch = useDispatch();

  const preferences = useSelector(selectPreferences);
  const deviceInfo = useSelector(selectDeviceInfo);

  const { preferLocalCurrency, localCurrency } =
    useSelector(selectLocalCurrency);

  const denominateSats = preferences["denominateSats"] === "true";

  const Currency = new CurrencyService(localCurrency);

  // get raw satoshi value from any currency input
  const amountToSats = (amount) => {
    // fiat mode
    if (preferLocalCurrency) {
      return Currency.fiatToSats(amount);
    }

    // sats mode
    if (denominateSats) {
      return amount;
    }

    // bch mode
    return bchToSats(amount);
  };

  // update displayed amount when currency is flipped
  useEffect(() => {
    const sats = satoshiInput.sats ? satoshiInput.sats : 0;
    onChange({ display: satsToDisplayAmount(sats), sats });
  }, [preferences.preferLocalCurrency, preferences.denominateSats]);

  const getMaxDecimals = () => {
    const maxDecimals = preferLocalCurrency ? 2 : denominateSats ? 0 : 8;

    return maxDecimals;
  };

  const numDecimalPlaces = (num) => {
    const split = num.split(".");
    const major = split[0];
    const minor = split.length > 1 ? split[1] : "";

    return minor.length;
  };

  const truncateDecimals = (value) => {
    const maxDecimals = getMaxDecimals();
    const decimals = numDecimalPlaces(value);

    const valueDecimal = new Decimal(Number.parseFloat(value) || 0);

    // limit decimal places and round down
    const amount = valueDecimal.toFixed(
      Math.min(decimals, maxDecimals),
      Decimal.ROUND_DOWN
    );

    return amount;
  };

  const handleInputEvent = (event) => {
    let input = event.target.value || "";
    const previousInput = satoshiInput.display;

    // "" -> "."
    if (event.target.value === ".") {
      input = "0.";
    }

    // double press "." to pad rest of number with max decimal places
    if (
      input.endsWith("..") || // "X.."
      (previousInput.includes(".") && // "X.xxx."
        !previousInput.endsWith(".") &&
        input.endsWith(".") &&
        input.length > previousInput.length)
    ) {
      const maxDecimals = getMaxDecimals();
      input = new Decimal(input.substring(0, input.length - 1)).toFixed(
        maxDecimals
      );
    }

    // limit decimal places appropriately
    const amount = truncateDecimals(input);
    const hasEndDecimal = input.endsWith(".");

    const sats = new Decimal(amountToSats(amount));
    if (sats.greaterThan(MAX_SATOSHI)) {
      return;
    }

    if (sats.lessThan(0)) {
      onChange({ display: "0", sats: "0" });
      return;
    }

    onChange({ display: `${amount}${hasEndDecimal ? "." : ""}`, sats });
  };

  // hide keyboard when "Enter" pressed on mobile
  const handleKeyDown = (event) => {
    if (deviceInfo.platform !== "web" && event.key === "Enter") {
      Keyboard.hide();
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      size={size}
      value={satoshiInput.display}
      onChange={handleInputEvent}
      onKeyDown={handleKeyDown}
    />
  );
}
