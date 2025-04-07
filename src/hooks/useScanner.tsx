import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import { ScanOutlined } from "@ant-design/icons";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import {
  selectDeviceInfo,
  setScannerIsScanning,
  selectScannerIsScanning,
} from "@/redux/device";

import ToastService from "@/services/ToastService";

import { translate } from "@/util/translations";
import translations from "@/views/wallet/ScannerButton/translations";

export function useScanner(onScan) {
  const dispatch = useDispatch();
  const deviceInfo = useSelector(selectDeviceInfo);
  const isScanning = useSelector(selectScannerIsScanning);

  const closeScanner = useCallback(async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
  }, [deviceInfo.platform]);

  const handleScanContent = useCallback(
    async (content) => {
      dispatch(setScannerIsScanning(false));

      const spawnScanToast = () =>
        ToastService().spawn({
          icon: <ScanOutlined className="text-4xl" />,
          header: translate(translations.scanContents),
          body: <span className="flex break-all text-sm">{content}</span>,
        });

      await onScan(content, spawnScanToast);
    },
    [dispatch, onScan]
  );

  const startScan = useCallback(async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.denied) {
      // we hit this code path if user says "never ask again or Ask Every Time"
      const { value: hasConsent } = await Dialog.confirm({
        title: translate(translations.permissionTitle),
        message: translate(translations.permissionMessage),
      });

      if (hasConsent) {
        BarcodeScanner.openAppSettings();
        return;
      }
    }

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });

    if (result.hasContent) {
      handleScanContent(result.content);
    }
  }, [deviceInfo.platform, handleScanContent]);

  useEffect(
    function cleanupScanner() {
      return () => {
        closeScanner();
      };
    },
    [closeScanner]
  );

  useEffect(
    function resetScanner() {
      if (isScanning) {
        startScan();
      } else {
        closeScanner();
      }
    },
    [isScanning, closeScanner, startScan]
  );

  const toggleScanner = () => {
    dispatch(setScannerIsScanning(!isScanning));
  };

  return { toggleScanner, handleScanContent };
}
