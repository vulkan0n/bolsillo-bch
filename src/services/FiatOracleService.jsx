import { bchToSats, satsToBch } from "@/util/sats";
import { Decimal } from "decimal.js";
import { selectPreferences } from "@/redux/preferences";
import { store } from "@/redux";

export default function FiatOracleService() {
  const preferences = selectPreferences(store.getState());

  const oracles = {
    USD: "125.02",
    CAD: "125.04",
    EUR: "125.03",
  };

  return {
    toSats,
    toBch,
    toFiat,
  };

  function toSats(amount) {
    return bchToSats(
      new Decimal(1 / oracles[preferences["localCurrency"]]).times(amount)
    );
  }

  function toBch(amount) {
    return new Decimal(satsToBch(toSats(amount))).toFixed(8).toString();
  }

  function toFiat(sats) {
    return new Decimal(satsToBch(sats))
      .times(oracles[preferences["localCurrency"]])
      .toFixed(2)
      .toString();
  }
}
