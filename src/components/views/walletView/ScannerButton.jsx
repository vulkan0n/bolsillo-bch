import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences } from "@/redux/preferences";
import { setIsScanning, selectIsScanning } from "@/redux/scanner";

import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import { ScanOutlined, CloseOutlined } from "@ant-design/icons";

import { validateInvoiceString } from "@/util/invoice";

export default function ScannerButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const isScanning = useSelector(selectIsScanning);

  const prepare = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: false });
      if (status.granted && preferences["scannerFastMode"] === "true") {
        BarcodeScanner.prepare();
      }
    } catch (e) {
      return;
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
      dispatch(setIsScanning(false));
      const scanned = result.content;

      const { valid, address, query } = validateInvoiceString(result.content);

      if (valid) {
        navigate(`/wallet/send/${address}${query}`);
      }
    }
  }

  async function closeScanner() {
    try {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (e) {
      return;
    }
  }

  const toggleScanner = () => {
    dispatch(setIsScanning(!isScanning));
  };

  return (
    <>
      <div
        className="flex justify-center fixed inset-x-0"
        style={{ bottom: "calc(100vh - 90%)" }}
      >
        <div className="flex items-center rounded-full border border-1 border-zinc-100 bg-white opacity-90" style={{width: "4.5rem", height: "4.5rem"}}>
          <button
            className="w-full h-full"
            type="button"
            onClick={toggleScanner}
          >
            {isScanning ? (
              <CloseOutlined className="text-3xl" />
            ) : (
              <ScanOutlined className="text-3xl" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
