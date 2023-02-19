import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import validateInvoiceString from "@/util/invoice";

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

      const { valid, address, query } = validateInvoiceString(result.content);

      if (valid) {
        navigate(`/wallet/send/${address}${query}`);
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
      <div className="flex justify-center fixed inset-x-0 bottom-24">
        <div className="flex items-center rounded-full border border-1 border-zinc-300 w-24 h-24 bg-zinc-50">
          <button
            className="w-full h-full"
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
