import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { validateInvoiceString } from "@/util/invoice";

function ScannerButton({ onScanStart, onScanEnd }) {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(function prepareScanner() {
    const prepare = async () => {
      const status = await BarcodeScanner.checkPermission({ force: false });

      if (status.granted) {
        BarcodeScanner.prepare();
      }
    };

    prepare();

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
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.denied) {
      // we hit this code path if user says "never ask again"
      // TODO: prompt user to BarcodeScanner.openAppSettings();
      return;
    }

    onScanStart();
    setIsScanning(true);

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });

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
