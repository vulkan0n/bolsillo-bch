import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { selectExchangeRates } from "@/redux/exchangeRates";
import { selectIsStablecoinMode } from "@/redux/preferences";
import { selectTransactionHistory, txHistoryFetch } from "@/redux/txHistory";

import TransactionItem from "@/atoms/TransactionItem";

// --------------------------------

function EmptyState() {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm text-neutral-400 dark:text-neutral-500">
        Todavía no tenés movimientos
      </p>
    </div>
  );
}

// --------------------------------

/** Compute the PUSD equivalent of a BCH amount at the current exchange rate. */
function satsToPusd(
  valueSatoshis: bigint,
  rates: Array<{ currency: string; price: string }>
): string {
  const usdRate = rates.find((r) => r.currency === "USD")?.price;
  if (!usdRate) return "";
  const absSats = valueSatoshis < 0n ? -valueSatoshis : valueSatoshis;
  const bchAmount = Number(absSats) / 100_000_000;
  const usdValue = bchAmount * Number(usdRate);
  return usdValue.toFixed(2);
}

// --------------------------------

export default function HomeRecentTransactions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const txHistory = useSelector(selectTransactionHistory);
  const isStablecoinMode = useSelector(selectIsStablecoinMode);
  const rates = useSelector(selectExchangeRates);

  useEffect(
    function loadHistory() {
      dispatch(txHistoryFetch());
    },
    [dispatch]
  );

  const recent = txHistory.slice(0, 5);

  // Pre-compute PUSD values for each tx when in stable mode
  const pusdValues = useMemo(() => {
    if (!isStablecoinMode) return null;
    return recent.map((tx) => satsToPusd(tx.valueSatoshis, rates));
  }, [recent, isStablecoinMode, rates]);

  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-h3 text-neutral-900 dark:text-neutral-100">
          Esta semana
        </h2>
        <button
          type="button"
          onClick={() => navigate("/wallet/history")}
          className="text-sm text-brand-600 dark:text-brand-400 font-medium"
        >
          Ver todo →
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          recent.map((tx, i) => (
            <TransactionItem
              key={`${tx.tx_hash}${tx.address}`}
              valueSatoshis={tx.valueSatoshis}
              time={tx.time}
              time_seen={tx.time_seen}
              fiat_amount={tx.fiat_amount}
              fiat_currency={tx.fiat_currency}
              pusdAmount={pusdValues ? pusdValues[i] : undefined}
              onClick={() => navigate(`/explore/tx/${tx.tx_hash}`)}
            />
          ))
        )}
      </div>
    </section>
  );
}
