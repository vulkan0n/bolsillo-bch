import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

import { selectCurrencySettings } from "@/redux/preferences";
import { clearSendDraft, selectSendDraft } from "@/redux/sendDraft";

import CurrencyService from "@/kernel/bch/CurrencyService";

import AppButton from "@/atoms/AppButton";
import { formatBch } from "@/util/format";

export default function SendSuccessView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector(selectSendDraft);
  const { localCurrency } = useSelector(selectCurrencySettings);

  const Currency = CurrencyService(localCurrency);

  const amountFiat = useMemo(() => {
    if (!draft.amountSats) return "0";
    const fiat = Currency.satsToFiat(draft.amountSats);
    return Number.parseFloat(fiat).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [draft.amountSats, Currency]);

  const prettyAddress = draft.address
    ? (() => {
        const hash = draft.address.includes(":")
          ? draft.address.split(":").pop()!
          : draft.address;
        return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
      })()
    : "";

  const symbol = Currency.getSymbol(localCurrency) || "$";

  function handleDone() {
    dispatch(clearSendDraft());
    navigate("/wallet");
  }

  return (
    <div className="flex flex-col min-h-full bg-neutral-25 dark:bg-neutral-1000">
      <div className="flex-1 flex flex-col items-center justify-center px-5 -mt-10">
        {/* Check circle */}
        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        <h1 className="text-h1 text-neutral-900 dark:text-neutral-100 mb-6">
          ¡Enviado!
        </h1>

        {/* Amounts */}
        <p className="text-display-sm text-neutral-900 dark:text-neutral-100 tabular-nums">
          {symbol} {amountFiat}
        </p>
        <p className="text-body text-neutral-400 dark:text-neutral-500 tabular-nums mt-1">
          {draft.amountSats ? formatBch(draft.amountSats) : "0.00"} BCH
        </p>

        {/* Address */}
        <p className="text-body text-neutral-500 dark:text-neutral-400 mt-4 tabular-nums">
          a {prettyAddress}
        </p>
      </div>

      {/* Bottom */}
      <div className="px-5 pb-safe pb-4 pt-2">
        <AppButton variant="primary" size="lg" fullWidth onClick={handleDone}>
          Listo
        </AppButton>
      </div>
    </div>
  );
}
