import PropTypes from "prop-types";

import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { useSelector } from "react-redux";
import { Decimal } from "decimal.js";
import {
  selectCurrencySettings,
  selectDenomination,
} from "@/redux/preferences";
import { selectDeviceInfo } from "@/redux/device";
import { bchToSats, MAX_SATOSHI, satsToDisplayAmount } from "@/util/sats";

import CurrencyService from "@/services/CurrencyService";

export default function SatoshiInput({
  className,
  satoshiInput,
  onChange,
  size,
}) {
  const DECIMAL_KEYS = [".", ",", "_", " "];

  const deviceInfo = useSelector(selectDeviceInfo);

  const { shouldPreferLocalCurrency, localCurrency } = useSelector(
    selectCurrencySettings
  );

  const [shouldUpdateDisplay, setShouldUpdateDisplay] = useState(false);

  // prevent infinite render loops
  useEffect(
    function updateDisplayAmount() {
      setShouldUpdateDisplay(true);
    },
    [shouldPreferLocalCurrency]
  );

  useEffect(
    function executeUpdateDisplayAmount() {
      if (shouldUpdateDisplay) {
        const sats = satoshiInput.sats ? satoshiInput.sats : 0;
        onChange({ display: satsToDisplayAmount(sats), sats });
        setShouldUpdateDisplay(false);
      }
    },
    [shouldUpdateDisplay, onChange, satoshiInput.sats]
  );

  const denominateSats = useSelector(selectDenomination); // TODO: bits, mBCH

  const Currency = new CurrencyService(localCurrency);

  // get raw satoshi value from any currency input
  const amountToSats = (amount) => {
    // fiat mode
    if (shouldPreferLocalCurrency) {
      return Currency.fiatToSats(amount);
    }

    // sats mode
    if (denominateSats) {
      return amount;
    }

    // bch mode
    return bchToSats(amount);
  };

  const getMaxDecimals = () => {
    if (shouldPreferLocalCurrency) {
      // fiat mode gets 2 decimals
      return 2;
    }

    // Sats mode has no decimals, BCH mode has 8 decimals
    return denominateSats ? 0 : 8;
  };

  const numDecimalPlaces = (num) => {
    const split = num.split(".");
    const major = split[0]; // eslint-disable-line @typescript-eslint/no-unused-vars
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

    onChange({ display: decimalInput, sats: sats.toString() });
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
        newInput = `${currentInput}.`;
      }

      if (!shouldPreferLocalCurrency && denominateSats) {
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
    const hasPrevEndDecimal = DECIMAL_KEYS.includes(prevLastChar);

    if (
      !hasEndDecimal || // allow dangling decimal (e.g. "123.")
      (hasEndDecimal && !hasPrevEndDecimal) // don't truncate decimals when user is trying to add/remove the decimal
    ) {
      handleInputChange(truncateDecimals(input));
    }
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

SatoshiInput.propTypes = {
  className: PropTypes.string,
  satoshiInput: PropTypes.shape({
    display: PropTypes.string.isRequired,
    sats: PropTypes.string.isRequired,
  }),
  onChange: PropTypes.func,
  size: PropTypes.number,
};

SatoshiInput.defaultProps = {
  className: "",
  satoshiInput: 0,
  onChange: () => null,
  size: 20,
};
