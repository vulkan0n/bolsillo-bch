import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { selectLastUpdatedAt } from "@/redux/exchangeRates";
import {
  selectBchNetwork,
  selectCurrencySettings,
  selectIsStablecoinMode,
} from "@/redux/preferences";
import { clearSendDraft, selectSendDraft } from "@/redux/sendDraft";
import { selectIsConnected, syncHotRefresh } from "@/redux/sync";
import {
  selectActiveWalletBalance,
  selectActiveWalletHash,
} from "@/redux/wallet";

import NotificationService from "@/kernel/app/NotificationService";
import CauldronService from "@/kernel/bch/CauldronService";
import CurrencyService from "@/kernel/bch/CurrencyService";
import TransactionBuilderService from "@/kernel/bch/TransactionBuilderService";
import TransactionManagerService from "@/kernel/bch/TransactionManagerService";
import TransactionHistoryService from "@/kernel/wallet/TransactionHistoryService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";

import SlideToAction from "@/atoms/SlideToAction";

import { formatBch } from "@/util/format";
import { PUSD_TOKENID } from "@/util/tokens";

export default function SendConfirmView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector(selectSendDraft);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const walletHash = useSelector(selectActiveWalletHash);
  const bchNetwork = useSelector(selectBchNetwork);
  const isConnected = useSelector(selectIsConnected);
  const isStablecoinMode = useSelector(selectIsStablecoinMode);
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
  const [effectiveAmount, setEffectiveAmount] = useState(0n);
  const [stableSwapInfo, setStableSwapInfo] = useState<{
    pusdAmount: string;
    executionPrice: string;
    rawSupply: string;
  } | null>(null);
  const [isCauldronDown, setIsCauldronDown] = useState(false);

  // -------- On mount: build the transaction to verify (with retry for fees)

  useEffect(() => {
    if (!draft.address || !draft.amountSats || !walletHash) {
      navigate("/wallet");
      return;
    }

    if (!draft.amountSats || draft.amountSats <= 0n) {
      setTxError("Saldo insuficiente para cubrir el envío y la fee de red");
      setIsVerifying(false);
      return;
    }

    const TxBuilder = TransactionBuilderService(walletHash);

    // --------------------------------
    // Stablecoin mode path: shortfall or Send Max triggers PUSD→BCH swap
    // --------------------------------
    async function attemptStableBuild() {
      try {
        const Cauldron = CauldronService();
        await Cauldron.fetchPools(PUSD_TOKENID);

        const UtxoManager = UtxoManagerService(walletHash);
        const pusdUtxos = UtxoManager.getCategoryUtxos(PUSD_TOKENID);
        const pusdBalance = pusdUtxos.reduce(
          (sum, u) => sum + (u.token_amount ?? 0n),
          0n
        );
        const price = Cauldron.getTokenPrice(PUSD_TOKENID); // sats per 0.01 PUSD unit

        // PUSD value in BCH sats: price is sats per base unit (0.01 PUSD),
        // so total = balance (base units) × price (sats/unit)
        const pusdValueInBch = pusdBalance * price;

        // Determine tradeSats: how much BCH we need from the swap
        // For Send Max (draft.isSendMax): swap ALL PUSD
        // For shortfall (amount > spendable_balance): swap just enough
        const { isSendMax } = draft;
        const tradeSats = isSendMax
          ? pusdValueInBch
          : draft.amountSats - spendable_balance;

        // Insufficient PUSD + reserve
        if (pusdValueInBch <= 0n || tradeSats > pusdValueInBch) {
          setTxError(
            "Saldo insuficiente. No tenés suficientes PUSD ni BCH de reserva."
          );
          setIsVerifying(false);
          return;
        }

        const totalValue = spendable_balance + pusdValueInBch;

        const result = await TxBuilder.buildStablecoinTransaction({
          recipients: [
            {
              address: draft.address,
              amount: isSendMax ? totalValue : draft.amountSats,
            },
          ],
          tradeSats,
          ...(isSendMax ? { totalValue } : {}),
        });

        if (typeof result === "bigint") {
          setTxError(
            "Saldo insuficiente. No tenés suficientes PUSD ni BCH de reserva."
          );
          setIsVerifying(false);
          return;
        }

        setTxStub(result);
        const rawSupply = result.tradeResult.summary.supply;
        const pusdFormatted = `${rawSupply / 100n}.${String(
          rawSupply % 100n
        ).padStart(2, "0")}`;
        setStableSwapInfo({
          pusdAmount: pusdFormatted,
          executionPrice: price.toString(),
          rawSupply: rawSupply.toString(),
        });
        setEffectiveAmount(isSendMax ? totalValue : draft.amountSats);
        setIsVerifying(false);
      } catch (e) {
        // Cauldron down — handled via isCauldronDown state and user-facing error
        setIsCauldronDown(true);
        setTxError("No se pudo completar el envío, reintentá más tarde.");
        setIsVerifying(false);
      }
    }

    // --------------------------------
    // Normal buildP2pkhTransaction path
    // --------------------------------
    function attemptBuild(tryAmount: bigint) {
      try {
        const result = TxBuilder.buildP2pkhTransaction({
          recipients: [{ address: draft.address, amount: tryAmount }],
          fee: 0n,
        });

        if (typeof result !== "bigint") {
          setEffectiveAmount(tryAmount);
          setTxStub(result);
          setTxError(null);
          setIsVerifying(false);
          return;
        }

        // Amount + fee exceeds available UTXOs — reduce amount by the fee found
        const feeFound = result - tryAmount;

        if (feeFound <= 0n) {
          setTxError("Saldo insuficiente para cubrir el envío y la fee de red");
          setIsVerifying(false);
          return;
        }

        const reduced = tryAmount - feeFound - 100n;
        if (reduced <= 0n) {
          setTxError("Saldo insuficiente para cubrir el envío y la fee de red");
          setIsVerifying(false);
          return;
        }

        attemptBuild(reduced);
      } catch (e) {
        setTxError("No pudimos preparar la transacción. Intentá de nuevo.");
        setIsVerifying(false);
      }
    }

    // --------------------------------
    // Entry: decide which path to take
    // --------------------------------
    if (
      isStablecoinMode &&
      (draft.isSendMax || draft.amountSats > spendable_balance)
    ) {
      // Stable path: insufficient BCH → swap PUSD, or Send Max liquidate all
      attemptStableBuild();
    } else if (draft.amountSats > spendable_balance) {
      setTxError("Saldo insuficiente para cubrir el envío");
      setIsVerifying(false);
    } else {
      attemptBuild(draft.amountSats);
    }
  }, [draft, walletHash, spendable_balance, navigate, isStablecoinMode]);

  // -------- Broadcast

  const handleBroadcast = useCallback(async () => {
    if (isBroadcasting.current || !txStub) return;
    isBroadcasting.current = true;

    try {
      if (!isConnected) {
        throw new Error("Sin conexión al servidor Electrum");
      }

      await TransactionManagerService().sendTransaction(txStub, bchNetwork);

      // Mark stable swap transactions in history (only if no user memo)
      if (stableSwapInfo && !draft.memo) {
        TransactionHistoryService(walletHash).setTransactionMemo(
          txStub.tx_hash,
          JSON.stringify({
            __swap: true,
            price: stableSwapInfo.executionPrice,
            pusdAmount: stableSwapInfo.rawSupply,
          })
        );
      }

      // Trigger immediate balance refresh
      dispatch(syncHotRefresh({ force: true }));

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
  }, [
    txStub,
    isConnected,
    bchNetwork,
    navigate,
    dispatch,
    stableSwapInfo,
    draft.memo,
    walletHash,
  ]);

  // -------- Derived display

  const amountSats = effectiveAmount;

  const amountFiat = useMemo(() => {
    if (!amountSats) return "0";
    const fiat = CoinCurrency.satsToFiat(amountSats);
    return Number.parseFloat(fiat).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amountSats, CoinCurrency]);

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
          className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0
                     active:bg-neutral-200 dark:active:bg-neutral-800"
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
            {/* Cauldron-down persistent banner */}
            {isCauldronDown && (
              <div className="w-full px-4 py-3 rounded-xl bg-warn-light dark:bg-warn/10 border border-warn/30">
                <p className="text-xs text-warn-dark dark:text-warn text-center">
                  Cauldron no está disponible. El envío requiere el servicio de
                  intercambio. Reintentá más tarde.
                </p>
              </div>
            )}
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
          <div className="flex-1 flex flex-col justify-center">
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
                    Incluida en el envío
                  </span>
                </div>

                {/* Swap info (stablecoin mode only) */}
                {stableSwapInfo && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 shrink-0">
                        Swap
                      </span>
                      <span className="text-body-md text-neutral-700 dark:text-neutral-300 tabular-nums">
                        {stableSwapInfo.pusdAmount} PUSD → BCH
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 shrink-0">
                        Precio
                      </span>
                      <span className="text-body-md text-neutral-700 dark:text-neutral-300 tabular-nums">
                        1 PUSD ≈{" "}
                        {formatBch(
                          BigInt(stableSwapInfo.executionPrice) * 100n
                        )}{" "}
                        BCH
                      </span>
                    </div>
                  </>
                )}
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
