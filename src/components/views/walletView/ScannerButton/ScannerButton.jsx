import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Dialog } from "@capacitor/dialog";
import { Haptics } from "@capacitor/haptics";
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

import Button from "@/components/atoms/Button";

import { validateInvoiceString } from "@/util/invoice";

import translations from "./translations";
import { translate } from "@/util/translations";

const { permissionTitle, permissionMessage, scan, close } = translations;

export default function ScannerButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deviceInfo = useSelector(selectDeviceInfo);
  const isScanning = useSelector(selectScannerIsScanning);

  useEffect(function cleanupScanner() {
    return () => {
      closeScanner();
    };
  }, []);

  useEffect(
    function resetScanner() {
      if (isScanning) {
        startScan();
      } else {
        closeScanner();
      }
    },
    [isScanning]
  );

  async function startScan() {
    if (deviceInfo.platform === "web") {
      return;
    }

    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.denied) {
      // we hit this code path if user says "never ask again or Ask Every Time"
      const { value: confirmed } = await Dialog.confirm({
        title: translate(permissionTitle),
        message: translate(permissionMessage),
      });

      if (confirmed) {
        BarcodeScanner.openAppSettings();
        return;
      }
    }

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });

    if (result.hasContent) {
      dispatch(setScannerIsScanning(false));

      const { isCashAddress, address, query } = validateInvoiceString(
        result.content
      );

      if (isCashAddress) {
        await Haptics.notification({ type: "SUCCESS" });
        navigate(`/wallet/send/${address}${query}`);
      } else {
        await Haptics.notification({ type: "ERROR" });
      }
    }
  }

  async function closeScanner() {
    if (deviceInfo.platform === "web") {
      return;
    }

    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
  }

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
