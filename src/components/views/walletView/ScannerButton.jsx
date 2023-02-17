import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import {
  decodeCashAddress,
  decodeCashAddressFormatWithoutPrefix,
} from "@bitauth/libauth";

function ScannerButton({ onScanStart, onScanEnd }) {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(function prepareScanner() {
    BarcodeScanner.prepare();

    return () => {
      stopScan();
    };
  }, []);

  useEffect(
    function resetScanner() {
      if (!isScanning) {
        BarcodeScanner.prepare();
      }
    },
    [isScanning]
  );

  async function startScan() {
    onScanStart();
    setIsScanning(true);

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      const scanned = result.content;
      setIsScanning(false);
      onScanEnd();

      const valid =
        typeof (scanned.includes(":")
          ? decodeCashAddress(scanned)
          : decodeCashAddressFormatWithoutPrefix(scanned)) === "object";

      if (valid) {
        navigate(`/wallet/send/${scanned}`);
      }
    }
  }

  function stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    setIsScanning(false);
    onScanEnd();
  }

  const toggleScanner = async () => {
    isScanning ? stopScan() : startScan();
  };

  return (
    <>
      <div className="flex justify-center absolute inset-x-0 bottom-20 mb-1">
        <div className="rounded-full border border-1 border-zinc-300 relative w-24 h-24 bottom-20 bg-zinc-50">
          <button
            className="absolute inset-0"
            type="button"
            onClick={toggleScanner}
          >
            {isScanning ? "Close" : "Open"} Scanner
          </button>
        </div>
      </div>
    </>
  );
}

export default ScannerButton;
