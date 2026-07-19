import { ArrowDown, ArrowUp } from "lucide-react";

import CurrencyService from "@/kernel/bch/CurrencyService";

import { formatBch } from "@/util/format";

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

// --------------------------------

export interface TransactionItemProps {
  valueSatoshis: bigint;
  time: number;
  time_seen: string;
  fiat_amount: string;
  fiat_currency: string;
  onClick: () => void;
  /** When set, overrides the BCH line with a PUSD amount (stable mode) */
  pusdAmount?: string;
}

// --------------------------------

export default function TransactionItem({
  valueSatoshis,
  time,
  time_seen,
  fiat_amount,
  fiat_currency,
  onClick,
  pusdAmount = undefined,
}: TransactionItemProps) {
  const isReceived = valueSatoshis > 0n;
  const sign = isReceived ? "+" : "−";
  const bchFormatted = formatBch(valueSatoshis);
  const fiatSymbol =
    CurrencyService(fiat_currency).getSymbol(fiat_currency) || "$";
  const fiatDisplay = fiat_amount
    ? `${sign}${fiatSymbol}${fiat_amount}`
    : `${sign}${bchFormatted} BCH`;

  const secondaryDisplay = pusdAmount
    ? `${sign}${pusdAmount} PUSD`
    : `${sign}${bchFormatted} BCH`;

  // ----------------

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-0 dark:bg-neutral-800 active:bg-neutral-50 dark:active:bg-neutral-700 transition-colors duration-150 w-full text-left"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isReceived
            ? "bg-brand-50 dark:bg-brand-900"
            : "bg-neutral-100 dark:bg-neutral-700"
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
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatRelativeTime(time, time_seen)}
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
        <p className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
          {secondaryDisplay}
        </p>
      </div>
    </button>
  );
}
