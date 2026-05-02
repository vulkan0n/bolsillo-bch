import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";

import { selectTransactionHistory, txHistoryFetch } from "@/redux/txHistory";

import type { MergedHistoryEntity } from "@/kernel/wallet/TransactionHistoryService";
import CurrencyService from "@/kernel/bch/CurrencyService";

// --------------------------------

function formatRelativeTime(unixSeconds: number, timeSeen: string): string {
  const ts = unixSeconds > 0 ? unixSeconds * 1000 : Date.parse(timeSeen);
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
}

function formatBch(sats: bigint): string {
  if (sats === 0n) return "0";
  const fixed = (Number(sats) / 1e8).toFixed(8);
  const [intPart, decPart] = fixed.split(".");
  const trimmed = (decPart.replace(/0+$/, "") || "0").padEnd(2, "0");
  return `${intPart}.${trimmed}`;
}

// --------------------------------

interface TransactionRowProps {
  tx: MergedHistoryEntity;
  onClick: () => void;
}

function TransactionRowInline({ tx, onClick }: TransactionRowProps) {
  const isReceived = tx.valueSatoshis > 0n;
  const absSats = isReceived ? tx.valueSatoshis : -tx.valueSatoshis;
  const sign = isReceived ? "+" : "−";
  const bchFormatted = formatBch(absSats);
  const fiatSymbol =
    CurrencyService(tx.fiat_currency).getSymbol(tx.fiat_currency) || "$";
  const fiatDisplay = tx.fiat_amount
    ? `${sign}${fiatSymbol}${tx.fiat_amount}`
    : `${sign}${bchFormatted} BCH`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-0 dark:bg-neutral-50 active:bg-neutral-50 dark:active:bg-neutral-100 transition-colors duration-150 w-full text-left"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isReceived
            ? "bg-brand-50 dark:bg-brand-50"
            : "bg-neutral-100 dark:bg-neutral-100"
        }`}
      >
        {isReceived ? (
          <ArrowDown
            className="w-5 h-5 text-brand-600 dark:text-brand-300"
            strokeWidth={1.75}
          />
        ) : (
          <ArrowUp
            className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
            strokeWidth={1.75}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-body-md text-neutral-900 dark:text-neutral-100 truncate">
          {isReceived ? "Recibido" : "Enviado"}
        </p>
        <p className="text-xs text-neutral-500">
          {formatRelativeTime(tx.time, tx.time_seen)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className={`text-body-md tabular-nums ${
            isReceived
              ? "text-brand-600 dark:text-brand-400"
              : "text-neutral-900 dark:text-neutral-100"
          }`}
        >
          {fiatDisplay}
        </p>
        <p className="text-xs text-neutral-400 tabular-nums">
          {sign}
          {bchFormatted} BCH
        </p>
      </div>
    </button>
  );
}

// --------------------------------

function EmptyState() {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm text-neutral-400">Todavía no tenés movimientos</p>
    </div>
  );
}

// --------------------------------

export default function HomeRecentTransactions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const txHistory = useSelector(selectTransactionHistory);

  useEffect(
    function loadHistory() {
      dispatch(txHistoryFetch());
    },
    [dispatch]
  );

  const recent = txHistory.slice(0, 5);

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
          recent.map((tx) => (
            <TransactionRowInline
              key={`${tx.tx_hash}${tx.address}`}
              tx={tx}
              onClick={() => navigate(`/explore/tx/${tx.tx_hash}`)}
            />
          ))
        )}
      </div>
    </section>
  );
}
