import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { selectLastUpdatedAt } from "@/redux/exchangeRates";
import { selectCurrencySettings } from "@/redux/preferences";
import {
  clearSendDraft,
  selectSendDraft,
} from "@/redux/sendDraft";
import { selectActiveWalletBalance, selectActiveWalletHash } from "@/redux/wallet";
import { selectBchNetwork } from "@/redux/preferences";
import { selectIsConnected } from "@/redux/sync";

import CurrencyService from "@/kernel/bch/CurrencyService";
import TransactionBuilderService from "@/kernel/bch/TransactionBuilderService";
import ElectrumService from "@/kernel/bch/ElectrumService";
import NotificationService from "@/kernel/app/NotificationService";

import SlideToAction from "@/atoms/SlideToAction";
import { formatBch } from "@/util/format";

const ESTIMATED_FEE_SATS = 300n;

export default function SendConfirmView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector(selectSendDraft);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const walletHash = useSelector(selectActiveWalletHash);
  const bchNetwork = useSelector(selectBchNetwork);
  const isConnected = useSelector(selectIsConnected);
  const { spendable_balance } = useSelector(selectActiveWalletBalance);
  const lastUpdatedAt = useSelector(selectLastUpdatedAt);

  const CoinCurrency = CurrencyService(localCurrency);

  // Prevent double-broadcast with a ref
  const isBroadcasting = useRef(false);

  const [txStub, setTxStub] = useState<{
    tx_hash: string;
    hex: string;
  } | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // -------- On mount: build the transaction to verify

  useEffect(() => {
    if (!draft.address || !draft.amountSats || !walletHash) {
      navigate("/wallet");
      return;
    }

    const amount = draft.amountSats;
    if (amount > spendable_balance) {
      setTxError("Saldo insuficiente para cubrir el envío");
      setIsVerifying(false);
      return;
    }

    try {
      const TxBuilder = TransactionBuilderService(walletHash);
      const result = TxBuilder.buildP2pkhTransaction({
        recipients: [{ address: draft.address, amount }],
        fee: 0n,
      });

      if (typeof result === "bigint") {
        setTxError("Saldo insuficiente para cubrir el envío y la fee de red");
        setIsVerifying(false);
        return;
      }

      setTxStub(result);
      setTxError(null);
    } catch (e) {
      setTxError("No pudimos preparar la transacción. Intentá de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  }, [draft, walletHash, spendable_balance, navigate]);

  // -------- Broadcast

  const handleBroadcast = useCallback(async () => {
    if (isBroadcasting.current || !txStub) return;
    isBroadcasting.current = true;

    try {
      if (!isConnected) {
        throw new Error("Sin conexión al servidor Electrum");
      }

      await ElectrumService(bchNetwork).broadcastTransaction(txStub.hex);

      navigate("/wallet/send/success");
    } catch (e) {
      NotificationService().error(
        "Error al enviar",
        "No se pudo enviar la transacción. Verificá tu conexión e intentá de nuevo."
      );
      navigate("/wallet/send/amount");
    } finally {
      isBroadcasting.current = false;
    }
  }, [txStub, isConnected, bchNetwork, navigate]);

  // -------- Derived display

  const amountSats = draft.amountSats ?? 0n;

  const feeFiat = useMemo(() => {
    const fiat = CoinCurrency.satsToFiat(ESTIMATED_FEE_SATS);
    return Number.parseFloat(fiat).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [CoinCurrency]);

  const amountFiat = useMemo(() => {
    if (!draft.amountSats) return "0";
    const fiat = CoinCurrency.satsToFiat(draft.amountSats);
    return Number.parseFloat(fiat).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [draft.amountSats, CoinCurrency]);

  const prettyAddress = draft.address
    ? (() => {
        const hash = draft.address.includes(":")
          ? draft.address.split(":").pop()!
          : draft.address;
        return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
      })()
    : "";

  const minutesSinceUpdate = useMemo(() => {
    if (!lastUpdatedAt) return null;
    return Math.floor((Date.now() - lastUpdatedAt) / 60000);
  }, [lastUpdatedAt]);

  const isStale = minutesSinceUpdate !== null && minutesSinceUpdate > 10;

  const symbol = CoinCurrency.getSymbol(localCurrency) || "$";

  if (isVerifying) {
    return (
      <div className="flex flex-col min-h-full bg-neutral-25 dark:bg-neutral-1000 items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-neutral-25 dark:bg-neutral-1000">
      {/* -------- Header */}
      <div className="flex items-center px-5 pt-safe-top pb-3 bg-neutral-25 dark:bg-neutral-1000">
        <button
          type="button"
          onClick={() => navigate("/wallet/send/amount")}
          className="w-10 h-10 flex items-center justify-center -ml-2"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>
        <h1 className="text-h2 text-neutral-900 dark:text-neutral-100 ml-2">
          Confirmar envío
        </h1>
      </div>

      {/* -------- Content */}
      <div className="flex-1 flex flex-col px-5">
        {/* Error state */}
        {txError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-body text-error text-center">{txError}</p>
            <button
              type="button"
              onClick={() => {
                dispatch(clearSendDraft());
                navigate("/wallet");
              }}
              className="text-brand-500 underline underline-offset-2"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Normal state */}
        {!txError && (
          <div className="flex-1 flex flex-col justify-center -mt-10">
            {/* Card de confirmación */}
            <div className="rounded-2xl bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-5 py-6">
              {/* Amount */}
              <div className="text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Vas a enviar
                </p>
                <p className="text-display-sm text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {symbol} {amountFiat}
                </p>
                <p className="text-body text-neutral-400 dark:text-neutral-500 tabular-nums mt-1">
                  {formatBch(amountSats)} BCH
                </p>
              </div>

              {/* Separator */}
              <hr className="my-5 border-t border-neutral-100 dark:border-neutral-700" />

              {/* Details */}
              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 shrink-0">
                    A
                  </span>
                  <span className="text-body-md text-neutral-800 dark:text-neutral-200 tabular-nums truncate">
                    {prettyAddress}
                  </span>
                </div>

                {/* Memo */}
                {draft.memo && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 shrink-0">
                      Memo
                    </span>
                    <span className="text-body text-neutral-700 dark:text-neutral-300">
                      {draft.memo}
                    </span>
                  </div>
                )}

                {/* Fee */}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 shrink-0">
                    Fee
                  </span>
                  <span className="text-body-md text-neutral-700 dark:text-neutral-300 tabular-nums">
                    ~{symbol} {feeFiat} ({formatBch(ESTIMATED_FEE_SATS)} BCH)
                  </span>
                </div>
              </div>

              {/* Stale rate */}
              {isStale && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Clock className="w-3.5 h-3.5 text-warn" strokeWidth={1.75} />
                  <p className="text-xs text-warn">
                    Cotización actualizada hace {minutesSinceUpdate} min
                  </p>
                </div>
              )}

              {/* Irreversibility warning */}
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-warn-light dark:bg-warn/10">
                <p className="text-sm text-warn-dark dark:text-warn text-center">
                  Esta operación no se puede deshacer
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------- Fixed bottom */}
      {!txError && (
        <div className="px-5 pb-safe pb-4 pt-2">
          <SlideToAction onComplete={handleBroadcast} />
        </div>
      )}
    </div>
  );
}
