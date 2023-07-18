import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@capacitor/dialog";

import { useSelector, useDispatch } from "react-redux";
import {
  setScannerIsScanning,
  selectScannerIsScanning,
  selectDeviceInfo,
} from "@/redux/device";

import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import { ScanOutlined, CloseOutlined } from "@ant-design/icons";

import { validateInvoiceString } from "@/util/invoice";

import Button from "@/components/atoms/Button";

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

    if (status.neverAsked) {
      // TODO: inform user that we will now do a permission check
      // This hopefully minimizes the chance that user will need to
      // fiddle with OS-level app settings.
      // `await informUserAboutPermissions();` - after await, proceed...
    }

    if (status.denied) {
      // we hit this code path if user says "never ask again or Ask Every Time"
      const { value: confirmed } = await Dialog.confirm({
        title: "Camera Permission Required",
        message:
          "Camera Permission is required to use the QR Code scanner. Would you like to open your device settings?",
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
        navigate(`/wallet/send/${address}${query}`);
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
  const scanLabel = isScanning ? "Close" : "Scan";
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
