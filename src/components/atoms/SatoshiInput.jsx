import { useEffect } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLocalCurrency,
  selectDenomination,
} from "@/redux/preferences";
import { selectDeviceInfo } from "@/redux/device";
import {
  bchToSats,
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
  const DECIMAL_KEYS = [".", ",", "_", " "];

  const deviceInfo = useSelector(selectDeviceInfo);

  const { preferLocalCurrency: isPreferLocalCurrency, localCurrency } =
    useSelector(selectLocalCurrency);

  const denominateSats = useSelector(selectDenomination); // TODO: bits, mBCH

  const Currency = new CurrencyService(localCurrency);

  // get raw satoshi value from any currency input
  const amountToSats = (amount) => {
    // fiat mode
    if (isPreferLocalCurrency) {
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
  }, [isPreferLocalCurrency, denominateSats]);

  const getMaxDecimals = () => {
    const maxDecimals = isPreferLocalCurrency ? 2 : denominateSats ? 0 : 8;

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

  // fired BEFORE text input is updated
  const handleKeyDown = (event) => {
    // hide keyboard when "Enter" pressed on mobile
    if (event.key === "Enter" && deviceInfo.platform !== "web") {
      Keyboard.hide();
      return;
    }

    // handle all possible decimal keys (i18n)
    const isDecimalKey =
      DECIMAL_KEYS.includes(event.key) ||
      (deviceInfo.platform === "android" && event.keyCode === 229); // android is dumb, so we cope by catching keyCode 229 and hoping for the best

    if (isDecimalKey) {
      const currentInput = satoshiInput.display;
      let newInput = currentInput;

      // double press "." to pad rest of number with max decimal places
      if (currentInput.includes(".")) {
        const maxDecimals = getMaxDecimals();
        newInput = new Decimal(currentInput).toFixed(maxDecimals);
      } else {
        newInput = `${currentInput}${event.key}`;
      }

      if (!isPreferLocalCurrency && denominateSats) {
        newInput = currentInput;
      }

      handleInputChange(newInput);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // fired AFTER text input is updated
  const handleInputChangeEvent = (event) => {
    const input = event.target.value || "0";
    const prevInput = satoshiInput.display || "0";

    const lastChar = input.substring(input.length - 1);
    const prevLastChar = prevInput.substring(prevInput.length - 1);

    const hasEndDecimal = DECIMAL_KEYS.includes(lastChar);
    const prevHasEndDecimal = DECIMAL_KEYS.includes(prevLastChar);

    if (
      !hasEndDecimal || // allow dangling decimal (e.g. "123.")
      (hasEndDecimal && !prevHasEndDecimal) // don't truncate decimals when user is trying to add/remove the decimal
    ) {
      handleInputChange(truncateDecimals(input));
    }
  };

  const handleInputChange = (input) => {
    const decimalInput = input.replace(/[^0-9.]/, ".");

    const sats = new Decimal(amountToSats(decimalInput));
    if (sats.greaterThan(MAX_SATOSHI)) {
      return;
    }

    if (sats.lessThan(0)) {
      onChange({ display: "0", sats: "0" });
      return;
    }

    onChange({ display: decimalInput, sats });
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      size={size}
      value={satoshiInput.display}
      onKeyDown={handleKeyDown}
      onChange={handleInputChangeEvent}
    />
  );
}
