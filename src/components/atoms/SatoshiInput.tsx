import { useState, useEffect, useCallback, forwardRef } from "react";
import { useSelector } from "react-redux";
import { Keyboard } from "@capacitor/keyboard";
import { Decimal } from "decimal.js";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectDeviceInfo } from "@/redux/device";
import { satsToBch, bchToSats, MAX_SATOSHI } from "@/util/sats";

import CurrencyService from "@/services/CurrencyService";

interface SatoshiInputProps {
  className: string;
  satoshis: number | Decimal;
  onChange: (sats: number) => void;
  size?: number;
  autoFocus?: boolean;
}

export const SatoshiInput = forwardRef(function SatoshiInput(
  { className, satoshis, onChange, size, autoFocus }: SatoshiInputProps,
  ref
) {
  const deviceInfo = useSelector(selectDeviceInfo);

  const { shouldPreferLocalCurrency, localCurrency, denomination } =
    useSelector(selectCurrencySettings);

  const satsToDisplayAmount = useCallback(
    (sats): string => {
      if (!sats || new Decimal(sats).equals(0)) {
        return "0";
      }

      if (shouldPreferLocalCurrency) {
        return CurrencyService(localCurrency).satsToFiat(sats);
      }

      return satsToBch(sats)[denomination].toString();
    },
    [shouldPreferLocalCurrency, localCurrency, denomination]
  );

  // get raw satoshi value from any currency input
  const amountToSats = (amount): Decimal => {
    // fiat mode
    if (shouldPreferLocalCurrency) {
      return CurrencyService(localCurrency).fiatToSats(amount);
    }

    // bch mode
    return bchToSats(amount, denomination);
  };

  const [displayValue, setDisplayValue] = useState(
    satsToDisplayAmount(satoshis)
  );

  const [shouldUseEffect, setShouldUseEffect] = useState(false);

  useEffect(
    function handleShouldUseEffect() {
      setShouldUseEffect(true);
    },
    [shouldPreferLocalCurrency]
  );

  useEffect(
    function renderOnCurrencyFlip() {
      if (shouldUseEffect) {
        setShouldUseEffect(false);
        setDisplayValue(satsToDisplayAmount(satoshis));
      }
    },
    [shouldUseEffect, satoshis, satsToDisplayAmount]
  );

  const getMaxDecimals = (): number => {
    if (shouldPreferLocalCurrency) {
      // fiat mode gets 2 decimals
      return 2;
    }

    switch (denomination) {
      case "sats":
        return 0;
      case "bits":
        return 2;
      case "mbch":
        return 5;
      case "bch":
      default:
        return 8;
    }
  };

  const numDecimalPlaces = (num): number => {
    const split = num.split(".");
    const major = split[0]; // eslint-disable-line @typescript-eslint/no-unused-vars
    const minor = split.length > 1 ? split[1] : "";

    return minor.length;
  };

  const truncateDecimals = (value): string => {
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

  const handleOnChange = (sats: number, display: string): void => {
    setDisplayValue(display.toString());
    onChange(sats);
  };

  const handleInputChange = (input: string): void => {
    const sats = amountToSats(input);

    if (sats.greaterThan(MAX_SATOSHI)) {
      return;
    }

    if (sats.lessThan(0)) {
      handleOnChange(0, "0");
      return;
    }

    handleOnChange(sats.toNumber(), input);
  };

  const DECIMAL_KEYS = [".", ","];

  // fired BEFORE HTML text input is rendered or updated
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
      const currentDisplay = displayValue;
      let newInput = currentDisplay;

      // double press "." to pad rest of number with max decimal places
      if (currentDisplay.includes(".")) {
        const maxDecimals = getMaxDecimals();
        newInput = new Decimal(currentDisplay).toFixed(maxDecimals);
      } else {
        newInput = `${currentDisplay}.`;
      }

      // ignore decimal in sats mode
      if (!shouldPreferLocalCurrency && denomination === "sats") {
        newInput = currentDisplay;
      }

      // pass modified input directly to handler
      // stop propagation to avoid firing handleInputChangeEvent
      handleInputChange(newInput);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // fired AFTER HTML text input is updated
  const handleInputChangeEvent = (event) => {
    const sanitizedInput = event.target.value.replace(/[^0-9.]/, ".");
    const currentInput = sanitizedInput;
    const prevInput = displayValue.toString();

    const lastChar = currentInput.substring(currentInput.length - 1);
    const prevLastChar = prevInput.substring(prevInput.length - 1);

    const hasEndDecimal = DECIMAL_KEYS.includes(lastChar);
    const hasPrevEndDecimal = DECIMAL_KEYS.includes(prevLastChar);

    if (
      !hasEndDecimal || // allow dangling decimal (e.g. "123.")
      (hasEndDecimal && !hasPrevEndDecimal) // don't truncate decimals when user is trying to add/remove the decimal
    ) {
      handleInputChange(truncateDecimals(currentInput));
    }
  };

  return (
    <input
      type="text"
      ref={ref}
      inputMode="decimal"
      className={className}
      placeholder="0"
      size={size}
      value={displayValue === "0" ? "" : displayValue}
      onKeyDown={handleKeyDown}
      onChange={handleInputChangeEvent}
      autoFocus={autoFocus}
    />
  );
});

SatoshiInput.defaultProps = {
  size: 20,
  autoFocus: false,
};
