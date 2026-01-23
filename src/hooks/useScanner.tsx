import { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScanOutlined } from "@ant-design/icons";
import QrScanner from "qr-scanner";
import { Torch } from "@capawesome/capacitor-torch";

import {
  setScannerIsScanning,
  selectScannerIsScanning,
  selectTorchIsEnabled,
} from "@/redux/device";

import NotificationService from "@/kernel/app/NotificationService";
import LogService from "@/kernel/app/LogService";

import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

const Log = LogService("useScanner");

// QrScanner singleton for performance (avoids 300ms recreation delay)
let _scanner: QrScanner | null = null;
let _currentScanCallback: ((data: string) => void) | null = null;

function initScanner(onScan) {
  _currentScanCallback = onScan;

  if (_scanner === null) {
    const video = document.createElement("video");
    // Use transparent 1x1 pixel as poster to hide default placeholder
    video.poster =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const scannerContainer = document.querySelector(
      "#scannerOutput"
    ) as HTMLDivElement;
    scannerContainer.appendChild(video);

    _scanner = new QrScanner(
      video,
      (result) => _currentScanCallback?.(result.data),
      {
        returnDetailedScanResult: true,
        maxScansPerSecond: 10,
        highlightScanRegion: false,
        highlightCodeOutline: true,
      }
    );
    // Scan both dark-on-light and light-on-dark QR codes
    _scanner.setInversionMode("both");
    Log.debug("initScanner");
  }

  return _scanner;
}

export function useScanner(onScan) {
  const dispatch = useDispatch();
  const isScanning = useSelector(selectScannerIsScanning);
  const isTorchEnabled = useSelector(selectTorchIsEnabled);

  const hasScanContent = useRef(false);

  const handleScanContent = useCallback(
    async (content) => {
      dispatch(setScannerIsScanning(false));

      const spawnScanToast = () =>
        NotificationService().spawn({
          icon: <ScanOutlined className="text-4xl" />,
          header: translate(translations.scanContents),
          body: <span className="flex break-all text-sm">{content}</span>,
        });

      const spawnInvalidScanToast = () =>
        NotificationService().invalidScan(content);

      if (!hasScanContent.current) {
        hasScanContent.current = true;
        await onScan(content, { spawnScanToast, spawnInvalidScanToast });
      }
    },
    [onScan, dispatch]
  );

  const scanner = initScanner(handleScanContent);

  const startScanner = useCallback(async () => {
    try {
      hasScanContent.current = false;
      await scanner.start();
    } catch (e) {
      // Squelch error that arises from trying to change srcVideo abruptly
      // Simply restart the camera if this happens
      if (e instanceof DOMException) {
        startScanner();
      } else {
        throw e;
      }
    }
  }, [scanner]);

  const stopScanner = useCallback(() => {
    scanner.stop();
  }, [scanner]);

  useEffect(
    function resetScanner() {
      if (scanner === null) {
        throw new Error("Scanner unavailable!");
      }

      if (isScanning) {
        startScanner();
      } else {
        stopScanner();
      }

      return () => {
        if (scanner !== null && isScanning) {
          stopScanner();
        }
      };
    },
    [scanner, isScanning, startScanner, stopScanner]
  );

  useEffect(
    function resetTorch() {
      if (scanner !== null) {
        if (isTorchEnabled) {
          Torch.enable();
        }
      }

      return () => {
        if (scanner !== null) {
          Torch.disable();
        }
      };
    },
    [scanner, isTorchEnabled]
  );
}
