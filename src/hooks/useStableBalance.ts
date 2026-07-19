import { useSelector } from "react-redux";

import { selectExchangeRates } from "@/redux/exchangeRates";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWalletBalance } from "@/redux/wallet";

import CurrencyService from "@/kernel/bch/CurrencyService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";

import { PUSD_DECIMALS, PUSD_TOKENID } from "@/util/tokens";

export interface StableBalance {
  pusdAmount: string;
  totalFiatFormatted: string;
  fiatCurrency: string;
  fiatSymbol: string;
}

// Number format for fiat display (matching existing patterns)
const fiatFormat = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useStableBalance(walletHash: string): StableBalance {
  const { spendable_balance } = useSelector(selectActiveWalletBalance);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const rates = useSelector(selectExchangeRates);

  // -------- PUSD token balance

  let pusdBaseUnits: bigint;
  try {
    const UtxoManager = UtxoManagerService(walletHash);
    const pusdUtxos = UtxoManager.getCategoryUtxos(PUSD_TOKENID);
    pusdBaseUnits = pusdUtxos.reduce(
      (sum, u) => sum + (u.token_amount ?? 0n),
      0n
    );
  } catch {
    pusdBaseUnits = 0n;
  }

  // -------- Convert PUSD to local currency
  // 1 PUSD = 1 USD. Derive USD→localCurrency from BCH exchange rates.
  // BCH/rate[local] = localCurrency per BCH
  // BCH/rate[USD]   = USD per BCH
  // USD→local       = BCH_local / BCH_USD

  const usdRate = rates.find((r) => r.currency === "USD")?.price ?? "1";
  const localRate =
    rates.find((r) => r.currency === localCurrency)?.price ?? "1";
  const bchToLocal = Number(localRate);
  const bchToUsd = Number(usdRate);
  const usdToLocal = bchToUsd > 0 ? bchToLocal / bchToUsd : 0;

  const pusdUnits = Number(pusdBaseUnits) / 10 ** PUSD_DECIMALS;
  const pusdInFiat = pusdUnits * usdToLocal;

  // -------- BCH reserve in local currency

  const Currency = CurrencyService(localCurrency);
  const bchReserveFiat = parseFloat(
    Currency.satsToFiat(spendable_balance) || "0"
  );

  // -------- Total

  const totalFiat =
    pusdInFiat + (Number.isNaN(bchReserveFiat) ? 0 : bchReserveFiat);
  const totalFiatFormatted = fiatFormat.format(totalFiat);
  const fiatSymbol = Currency.getSymbol(localCurrency) || "$";
  const pusdAmount = pusdUnits.toFixed(PUSD_DECIMALS);

  return {
    pusdAmount,
    totalFiatFormatted,
    fiatCurrency: localCurrency,
    fiatSymbol,
  };
}
