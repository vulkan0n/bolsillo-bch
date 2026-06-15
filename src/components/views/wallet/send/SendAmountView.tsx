import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock, Pencil, QrCode } from "lucide-react";

import { selectLastUpdatedAt } from "@/redux/exchangeRates";
import { selectCurrencySettings } from "@/redux/preferences";
import {
  initSendDraft,
  selectSendDraft,
  setAmountFiat,
  setAmountSats,
  setMemo,
} from "@/redux/sendDraft";
import { selectActiveWalletBalance } from "@/redux/wallet";

import CurrencyService from "@/kernel/bch/CurrencyService";

import AppButton from "@/atoms/AppButton";

import { formatBch } from "@/util/format";
import { validateBip21Uri } from "@/util/uri";

const CHIPS = [1000, 2000, 5000, 10000];

export default function SendAmountView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector(selectSendDraft);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const { spendable_balance } = useSelector(selectActiveWalletBalance);
  const lastUpdatedAt = useSelector(selectLastUpdatedAt);

  const Currency = CurrencyService(localCurrency);

  // -------- Input state

  const [rawInput, setRawInput] = useState(draft.amountFiat ?? "");
  const [memoInput, setMemoInput] = useState(draft.memo ?? "");

  // Manual address entry state (when coming from "Ingresar dirección manualmente")
  const [manualAddress, setManualAddress] = useState("");

  const validatedAddress = useMemo(() => {
    if (draft.address) return draft.address;
    if (!manualAddress.trim()) return null;
    const result = validateBip21Uri(manualAddress.trim());
    return result.isCashAddress ? result.address : null;
  }, [draft.address, manualAddress]);

  const isValidating = manualAddress.trim().length > 0 && validatedAddress === null;
  const hasValidAddress = draft.address !== null || validatedAddress !== null;

  // -------- Computed values

  const numericValue = useMemo(
    () => Number.parseFloat(rawInput.replace(",", ".")) || 0,
    [rawInput]
  );

  const amountSats = useMemo(
    () => (numericValue > 0 ? Currency.fiatToSats(numericValue) : 0n),
    [numericValue, Currency]
  );

  const bchDisplay = useMemo(
    () => (amountSats > 0n ? formatBch(amountSats) : "0.00"),
    [amountSats]
  );

  const isInsufficient = amountSats > spendable_balance;

  const minutesSinceUpdate = useMemo(() => {
    if (!lastUpdatedAt) return null;
    return Math.floor((Date.now() - lastUpdatedAt) / 60000);
  }, [lastUpdatedAt]);

  const isStale = minutesSinceUpdate !== null && minutesSinceUpdate > 10;

  const canContinue =
    numericValue > 0 && !isInsufficient && lastUpdatedAt !== null && hasValidAddress;

  // -------- Handlers

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // eslint-disable-next-line prefer-regex-literals
      if (/^[\d,]*$/.test(val) && (val.match(/,/g) || []).length <= 1) {
        setRawInput(val);
      }
    },
    []
  );

  const handleAddressInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualAddress(e.target.value);
    },
    []
  );

  const handleChip = useCallback((value: number) => {
    setRawInput(String(value));
  }, []);

  const handleContinue = useCallback(() => {
    // If manual address, init draft first
    if (!draft.address && validatedAddress) {
      dispatch(initSendDraft({ address: validatedAddress }));
    }
    dispatch(setAmountFiat(rawInput));
    dispatch(setAmountSats(amountSats));
    dispatch(setMemo(memoInput));
    navigate("/wallet/send/confirm");
  }, [dispatch, draft.address, validatedAddress, rawInput, amountSats, memoInput, navigate]);

  // -------- Derived display

  const prettyAddress = useMemo(() => {
    const addr = draft.address || validatedAddress || "";
    if (!addr) return "";
    const hash = addr.includes(":") ? addr.split(":").pop()! : addr;
    return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
  }, [draft.address, validatedAddress]);

  const selectedChip = CHIPS.find((c) => String(c) === rawInput);

  return (
    <div className="flex flex-col min-h-full bg-neutral-25 dark:bg-neutral-1000">
      {/* -------- Header */}
      <div className="flex items-center px-5 pt-safe-top pb-3 bg-neutral-25 dark:bg-neutral-1000">
        <button
          type="button"
          onClick={() => navigate("/wallet/send/scan")}
          className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0
                     active:bg-neutral-200 dark:active:bg-neutral-800"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>
        <h1 className="text-h2 text-neutral-900 dark:text-neutral-100 ml-2">Enviar</h1>
      </div>

      {/* -------- Content */}
      <div className="flex-1 flex flex-col px-5">
        {/* Address: read-only from scan | editable from manual entry */}
        {draft.address ? (
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Para</span>
            <span className="text-body-md text-neutral-800 dark:text-neutral-200 tabular-nums truncate">
              {prettyAddress}
            </span>
          </div>
        ) : (
          <div className="mb-6">
            <label htmlFor="manual-address" className="text-sm text-neutral-500 dark:text-neutral-400 mb-1.5 block">
              Dirección
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-250 dark:bg-neutral-800">
              <input
                id="manual-address"
                type="text"
                value={manualAddress}
                onChange={handleAddressInput}
                placeholder="bitcoincash:qzn8..."
                autoFocus={!draft.address}
                className="flex-1 bg-transparent text-body text-neutral-900 dark:text-neutral-100 
                           placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                           outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => navigate("/wallet/send/scan")}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                           bg-neutral-300/50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                aria-label="Escanear QR"
              >
                <QrCode className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
            {isValidating && (
              <p className="text-xs text-error mt-1.5">
                Dirección inválida. Ingresá una dirección CashAddr (bitcoincash:...)
              </p>
            )}
          </div>
        )}

        {/* -------- Monto */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl text-neutral-400 dark:text-neutral-500 font-medium -translate-y-2">
              {Currency.getSymbol(localCurrency) || "$"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={handleInput}
              placeholder="0"
              autoFocus={!!draft.address}
              className="w-full max-w-[320px] bg-transparent text-center text-display text-neutral-900 dark:text-neutral-100 
                         tabular-nums outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 p-0
                         focus:outline-none"
            />
          </div>

          {numericValue > 0 && (
            <p className="text-center text-base text-neutral-400 dark:text-neutral-500 tabular-nums mt-2">
              ≈ {bchDisplay} BCH
            </p>
          )}

          {isStale && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Clock className="w-3.5 h-3.5 text-warn" strokeWidth={1.75} />
              <p className="text-xs text-warn">
                Cotización actualizada hace {minutesSinceUpdate} min
              </p>
            </div>
          )}

          {numericValue > 0 && isInsufficient && (
            <p className="text-sm text-error mt-3">No tenés saldo suficiente</p>
          )}
        </div>

        {/* -------- Chips */}
        <div className="flex justify-center gap-2 mb-6">
          {CHIPS.map((chip) => {
            const isSelected = selectedChip === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className={`px-3.5 py-1.5 rounded-lg text-body-md transition-all duration-100
                  active:scale-[0.97]
                  focus-visible:outline-2 focus-visible:outline-brand-500 outline-offset-2
                  ${
                    isSelected
                      ? "bg-neutral-900 dark:bg-neutral-0 text-white dark:text-neutral-900 font-medium"
                      : "bg-neutral-250 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
              >
                ${chip.toLocaleString("es-AR")}
              </button>
            );
          })}
        </div>

        {/* -------- Memo */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-250 dark:bg-neutral-800">
            <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" strokeWidth={1.75} />
            <input
              id="send-memo"
              type="text"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              placeholder="Agregar una nota (opcional)"
              maxLength={220}
              className="flex-1 bg-transparent text-body text-neutral-900 dark:text-neutral-100 
                         placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* -------- Fixed bottom */}
      <div className="px-5 pb-safe pb-4 pt-2">
        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continuar
        </AppButton>
      </div>
    </div>
  );
}
