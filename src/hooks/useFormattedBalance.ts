import { useSelector } from "react-redux";

import { selectLocale } from "@/redux/device";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWalletBalance } from "@/redux/wallet";

import CurrencyService from "@/kernel/bch/CurrencyService";

export interface FormattedBalance {
  fiatAmount: string;
  fiatCurrency: string;
  bchAmount: string;
}

export function useFormattedBalance(): FormattedBalance {
  const { spendable_balance } = useSelector(selectActiveWalletBalance);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const locale = useSelector(selectLocale);

  const Currency = CurrencyService(localCurrency);

  // satsToFiat returns a fixed-decimal string, e.g. "1247890.50" for ARS or "12.47" for USD
  const fiatString = Currency.satsToFiat(spendable_balance);
  const fiatNumeric = parseFloat(fiatString);
  const decimals = fiatString.includes(".")
    ? fiatString.split(".")[1].length
    : 0;

  const fiatAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fiatNumeric);

  const fiatCurrency = Currency.getSymbol(localCurrency) || "$";

  // BCH amount: trim trailing zeros past 2 decimal places
  let bchAmount = "0";
  if (spendable_balance !== 0n) {
    const fixed = (Number(spendable_balance) / 1e8).toFixed(8);
    const [intPart, decPart] = fixed.split(".");
    const trimmed = (decPart.replace(/0+$/, "") || "0").padEnd(2, "0");
    bchAmount = `${intPart}.${trimmed}`;
  }

  return { fiatAmount, fiatCurrency, bchAmount };
}
