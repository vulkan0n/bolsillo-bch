import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { X } from "lucide-react";

import { setScannerIsScanning } from "@/redux/device";
import { initSendDraft } from "@/redux/sendDraft";

import { useScanner } from "@/hooks/useScanner";

import { validateBip21Uri } from "@/util/uri";

import AppButton from "@/atoms/AppButton";
import NotificationService from "@/kernel/app/NotificationService";

export default function SendScanView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cameraState, setCameraState] = useState<
    "loading" | "active" | "denied" | "no-camera"
  >("loading");

  const handleScan = useCallback(
    async (content: string) => {
      const result = validateBip21Uri(content);

      if (!result.isBip21) {
        NotificationService().invalidScan(content);
        return;
      }

      if (result.isBase58Address) {
        NotificationService().error(
          "Dirección no soportada",
          "Usá una dirección CashAddr (bitcoincash:...) en vez de formato legacy."
        );
        return;
      }

      if (result.isCashAddress && result.satoshis) {
        dispatch(
          initSendDraft({
            address: result.address,
            amountSats: result.satoshis,
            memo: result.message ?? null,
          })
        );
        navigate("/wallet/send/confirm");
        return;
      }

      if (result.isCashAddress) {
        dispatch(
          initSendDraft({
            address: result.address,
            memo: result.message ?? null,
          })
        );
        navigate("/wallet/send/amount");
      }
    },
    [dispatch, navigate]
  );

  useScanner(handleScan);

  // -------- Start scanning on mount, stop on unmount

  useEffect(
    function startScanner() {
      dispatch(setScannerIsScanning(true));
      setCameraState("active");
    },
    [dispatch]
  );

  useEffect(
    function stopScannerOnUnmount() {
      return () => {
        dispatch(setScannerIsScanning(false));
      };
    },
    [dispatch]
  );

  function handleManualEntry() {
    navigate("/wallet/send/amount");
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera output — full viewport */}
      <div id="scannerOutput" className="absolute inset-0" />

      {/* Overlay mask: box-shadow cutout lets camera show through center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]" />
      </div>

      {/* Scan frame border */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-2xl border-2 border-brand-500" />
      </div>

      {/* UI layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Close button */}
        <button
          type="button"
          onClick={() => navigate("/wallet")}
          className="pointer-events-auto absolute top-safe-top right-5 w-10 h-10 flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X className="w-7 h-7 text-white" />
        </button>

        {/* Camera state overlays */}
        {cameraState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-auto">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {cameraState === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-5 gap-4 pointer-events-auto">
            <p className="text-white text-body text-center">
              Necesitamos acceso a la cámara para escanear códigos QR
            </p>
            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleManualEntry}
            >
              Ingresar dirección manualmente
            </AppButton>
          </div>
        )}

        {cameraState === "no-camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-5 gap-4 pointer-events-auto">
            <p className="text-white text-body text-center">
              No se detectó una cámara en este dispositivo
            </p>
            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleManualEntry}
            >
              Ingresar dirección manualmente
            </AppButton>
          </div>
        )}

        {/* Hint text + manual entry button */}
        {cameraState === "active" && (
          <>
            <p className="absolute bottom-28 left-0 right-0 text-center text-white text-body">
              Apuntá al código QR
            </p>
            <button
              type="button"
              onClick={handleManualEntry}
              className="pointer-events-auto absolute bottom-16 left-0 right-0 mx-auto w-fit text-white text-sm underline underline-offset-2"
            >
              Ingresar dirección manualmente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
