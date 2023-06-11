import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences } from "@/redux/preferences";
import {
  setScannerIsScanning,
  selectScannerIsScanning,
  selectKeyboardIsOpen,
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
  const preferences = useSelector(selectPreferences);
  const deviceInfo = useSelector(selectDeviceInfo);
  const isScanning = useSelector(selectScannerIsScanning);
  const keyboardIsOpen = useSelector(selectKeyboardIsOpen);

  const prepare = async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    const status = await BarcodeScanner.checkPermission({ force: false });
    if (status.granted && preferences["scannerFastMode"] === "true") {
      BarcodeScanner.prepare();
    }
  };

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
        prepare();
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
      // TODO: prompt user before doing this, it's kind of invasive.
      BarcodeScanner.openAppSettings();
      return;
    }

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });

    if (result.hasContent) {
      dispatch(setScannerIsScanning(false));
      const scanned = result.content;

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

  return <Button icon={ScanIcon} label={scanLabel} onClick={toggleScanner} labelColor={scanLabelColor} iconSize="4xl" />;
}
