import { useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Copy } from "lucide-react";

import {
  selectBchNetwork,
  selectCurrencySettings,
  selectQrCodeSettings,
} from "@/redux/preferences";
import { selectActiveWalletHash } from "@/redux/wallet";

import LogService from "@/kernel/app/LogService";
import AddressManagerService from "@/kernel/wallet/AddressManagerService";
import NotificationService from "@/kernel/app/NotificationService";
import TransactionHistoryService from "@/kernel/wallet/TransactionHistoryService";

import { useClipboard } from "@/hooks/useClipboard";

import { logos } from "@/util/logos";
import { getPrefix } from "@/util/network";

const Log = LogService("WalletViewReceive");

export default function WalletViewReceive() {
  const navigate = useNavigate();
  const walletHash = useSelector(selectActiveWalletHash);
  const bchNetwork = useSelector(selectBchNetwork);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const qrCodeSettings = useSelector(selectQrCodeSettings);

  const addressManager = AddressManagerService(walletHash);
  const addressEntity = addressManager.getReceiveAddresses(1)[0];
  const address = addressEntity?.address || "";

  const { handleCopyToClipboard } = useClipboard();
  const [hasJustCopied, setJustCopied] = useState(false);

  // -------- BIP21 URI

  const qrPrefix = getPrefix(bchNetwork);
  const hash = address.includes(":") ? address.split(":").pop()! : address;
  const qrValue = `${qrPrefix}:${hash}`;

  // -------- QR display

  const isTestnet = bchNetwork !== "mainnet";
  const qrBgColor = isTestnet ? "#ffffff" : qrCodeSettings.background;
  const qrFgColor = isTestnet ? "#000000" : qrCodeSettings.foreground;
  const qrLogoImage = logos[qrCodeSettings.logo.toLowerCase()]?.img || "";

  // -------- Payment monitoring

  useEffect(
    function watchIncomingPayment() {
      Log.debug("watchIncomingPayment mounted");

      // null = first poll hasn't established baseline yet
      let knownTxCount: number | null = null;

      const interval = setInterval(async () => {
        try {
          const result = await TransactionHistoryService(
            walletHash,
            localCurrency,
            bchNetwork
          ).resolveTransactionHistory(0, 5, "", {});

          const { transactions: txs, total } = result;

          // First poll: absorb existing transactions as baseline, don't trigger
          if (knownTxCount === null) {
            knownTxCount = total;
            Log.debug("baseline set — total:", knownTxCount);
            return;
          }

          // Use result.total instead of txs.length — total reflects ALL transactions,
          // while txs is capped at 5 and won't grow if there are already 5+
          if (total > knownTxCount) {
            Log.debug("new transactions detected — total:", total);

            const incomingTx = txs.find((tx) => tx.valueSatoshis > 0n);

            if (incomingTx) {
              Log.debug(
                "incoming payment:",
                incomingTx.valueSatoshis.toString()
              );
              NotificationService().paymentReceived(incomingTx.valueSatoshis);
              navigate("/wallet");
            } else {
              Log.debug("new tx but not incoming (outgoing/self)");
            }

            knownTxCount = total;
          }
        } catch (err) {
          Log.warn("poll failed", err);
        }
      }, 3000);

      return () => {
        Log.debug("watchIncomingPayment unmounted");
        clearInterval(interval);
      };
    },
    [walletHash, localCurrency, bchNetwork, navigate]
  );

  // -------- Handlers

  const handleCopy = useCallback(() => {
    if (!address) return;
    handleCopyToClipboard(address, "Dirección copiada", "Recibir");
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }, [address, handleCopyToClipboard]);

  // -------- Render

  return (
    <div className="flex flex-col min-h-full bg-neutral-25 dark:bg-neutral-1000">
      {/* -------- Header */}
      <div className="flex items-center px-5 pt-safe-top pb-3 bg-neutral-25 dark:bg-neutral-1000">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-12 h-12 flex items-center justify-center text-neutral-700 dark:text-neutral-300 active:scale-[0.98] transition-all duration-100"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-h2 text-neutral-900 dark:text-neutral-100 ml-2">
          Recibir
        </h1>
      </div>

      {/* -------- Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
        <div
          className={`rounded-2xl overflow-hidden border-4 ${isTestnet ? "border-[#ff0000]" : "border-brand-700 dark:border-primarydark-400"}`}
        >
          <QRCode
            value={qrValue}
            ecLevel="L"
            size={280}
            quietZone={16}
            bgColor={qrBgColor}
            fgColor={qrFgColor}
            logoImage={qrLogoImage}
            logoWidth={48}
            logoHeight={48}
          />
        </div>

        <p className="font-mono text-sm break-all select-all text-neutral-700 dark:text-neutral-300 text-center mt-6 max-w-sm">
          {address}
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className={`mt-6 h-12 px-5 rounded-xl flex items-center gap-2 text-body-md font-medium transition-all duration-150 active:scale-[0.98] ${
            hasJustCopied
              ? "bg-brand-50 text-brand-700 border border-brand-500"
              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
          }`}
          aria-label="Copiar dirección"
        >
          {hasJustCopied ? (
            <Check className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Copy className="w-5 h-5" strokeWidth={1.75} />
          )}
          {hasJustCopied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
