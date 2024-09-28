import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Dialog } from "@capacitor/dialog";
import { Haptics, NotificationType } from "@capacitor/haptics";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import { ScanOutlined, CloseOutlined } from "@ant-design/icons";
import {
  selectDeviceInfo,
  setScannerIsScanning,
  selectScannerIsScanning,
} from "@/redux/device";

import Button from "@/atoms/Button";

import { validateInvoiceString } from "@/util/invoice";
import { validateWifString } from "@/util/sweep";

import translations from "./translations";
import { translate } from "@/util/translations";

const { permissionTitle, permissionMessage, scan, close } = translations;

export default function ScannerButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

      const { isCashAddress, address, query } = validateInvoiceString(content);
      const { isWif, wif } = validateWifString(content);

      debugger;

      if (isCashAddress) {
        await Haptics.notification({ type: NotificationType.Success });
        navigate(`/wallet/send/${address}${query}`);
      } else if (isWif) {
        await Haptics.notification({ type: NotificationType.Success });
        navigate(`/wallet/sweep/${wif}`);
      } else {
        await Haptics.notification({ type: NotificationType.Error });
      }
    },
    [dispatch, navigate]
  );

  const startScan = useCallback(async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.denied) {
      // we hit this code path if user says "never ask again or Ask Every Time"
      const { value: hasConsent } = await Dialog.confirm({
        title: translate(permissionTitle),
        message: translate(permissionMessage),
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

  const ScanIcon = isScanning ? CloseOutlined : ScanOutlined;
  const closeTranslation = translate(close);
  const scanTranslation = translate(scan);
  const scanLabel = isScanning ? closeTranslation : scanTranslation;
  const scanLabelColor = isScanning ? "white opacity-80" : undefined;

  return (
    <Button
      icon={ScanIcon}
      label={scanLabel}
      onClick={toggleScanner}
      labelColor={scanLabelColor}
      iconSize="4xl"
    />
  );
}
