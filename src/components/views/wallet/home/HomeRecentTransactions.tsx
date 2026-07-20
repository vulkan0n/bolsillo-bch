import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

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

/** Extract PUSD display amount from a swap memo, or null if not a swap tx. */
function parseSwapPusd(memo: string): string | null {
  if (!memo || !memo.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(memo);
    if (parsed && parsed.__swap && parsed.pusdAmount) {
      return (Number(parsed.pusdAmount) / 100).toFixed(2);
    }
  } catch {
    // not a swap memo
  }
  return null;
}

// --------------------------------

export default function HomeRecentTransactions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const txHistory = useSelector(selectTransactionHistory);
  const isStablecoinMode = useSelector(selectIsStablecoinMode);

  useEffect(
    function loadHistory() {
      dispatch(txHistoryFetch());
    },
    [dispatch]
  );

  const recent = txHistory.slice(0, 5);

  // Pre-compute PUSD values only for transactions that were actual swaps.
  // Historical pure-BCH transactions keep their original BCH display.
  const pusdValues = useMemo(() => {
    if (!isStablecoinMode) return null;
    return recent.map((tx) => parseSwapPusd(tx.memo));
  }, [recent, isStablecoinMode]);

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
