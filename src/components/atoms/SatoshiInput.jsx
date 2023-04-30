import { useState, useEffect } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { selectDeviceInfo } from "@/redux/device";
import { bchToSats, satsToBch, DUST_LIMIT, MAX_SATOSHI } from "@/util/sats";

import { Decimal } from "decimal.js";

import FiatOracleService from "@/services/FiatOracleService";

export default function SatoshiInput({ className, allowFiat, onChange, sats }) {
  const preferences = useSelector(selectPreferences);
  const deviceInfo = useSelector(selectDeviceInfo);

  const FiatOracle = new FiatOracleService();

  function satsToDisplayAmount() {
    return preferences["preferLocalCurrency"] === "true"
      ? FiatOracle.toFiat(sats)
      : preferences["denominateSats"] === "true"
      ? sats
      : satsToBch(sats);
  }

  useEffect(
    () => setDisplayAmount(satsToDisplayAmount()),
    [preferences.preferLocalCurrency, preferences.denominateSats]
  );

  const [displayAmount, setDisplayAmount] = useState(satsToDisplayAmount());

  const numDecimalPlaces = (num) => {
    const split = num.split(".");
    const major = split[0];
    const minor = split.length > 1 ? split[1] : "";

    console.log(num, minor.length);

    return minor.length;
  };

  const handleInputChange = (amount, sats) => {
    if (new Decimal(sats).greaterThan(MAX_SATOSHI)) {
      setDisplayAmount(displayAmount);
      return;
    }

    if (new Decimal(sats).lessThan(0)) {
      setDisplayAmount(0);
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

  return (
    <div className="flex items-center">
      {preferences["preferLocalCurrency"] === "true" && allowFiat ? (
        <>
          <div className="text-xl px-0.5 font-mono font-semibold">
            {FiatOracle.getSymbol(preferences["localCurrency"])}
          </div>
          <input
            type="number"
            placeholder={FiatOracle.toFiat(2500000)}
            min="0"
            max={FiatOracle.toFiat(MAX_SATOSHI)}
            step="0.01"
            className={className}
            value={displayAmount}
            onChange={(event) => {
              const amount = event.target.value || "0";
              const sats = FiatOracle.toSats(amount);
              const decimals = numDecimalPlaces(amount);

              handleInputChange(
                new Decimal(amount).toFixed(
                  Math.min(decimals, 2),
                  Decimal.ROUND_DOWN
                ),
                sats
              );
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-base px-0.5 font-mono font-semibold">
            {preferences["localCurrency"]}
          </div>
        </>
      ) : preferences["denominateSats"] === "true" ? (
        <>
          <div className="text-xl px-0.5 font-mono">₿</div>
          <input
            type="number"
            placeholder="25000000"
            min="0"
            max={MAX_SATOSHI}
            step="1000"
            className={className}
            value={displayAmount}
            onChange={(event) => {
              const sats = new Decimal(event.target.value || 0).toString();
              handleInputChange(sats, sats);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-base px-0.5 font-mono font-semibold">sats</div>
        </>
      ) : (
        <>
          <div className="text-xl px-0.5 font-mono">₿</div>
          <input
            type="number"
            placeholder="0.25000000"
            min="0"
            step="0.00001000"
            max={satsToBch(MAX_SATOSHI)}
            className={className}
            value={displayAmount}
            onChange={(event) => {
              const amount = event.target.value || "0";
              const sats = bchToSats(amount);
              const decimals = numDecimalPlaces(amount);

              handleInputChange(
                new Decimal(amount).toFixed(
                  Math.min(decimals, 8),
                  Decimal.ROUND_DOWN
                ),
                sats
              );
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-base px-0.5 font-mono font-semibold">BCH</div>
        </>
      )}
    </div>
  );
}
