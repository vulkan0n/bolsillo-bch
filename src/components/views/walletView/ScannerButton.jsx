import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";

function ScannerButton({ onScanStart, onScanEnd }) {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  const toggleScanner = async () => {
    if (isScanning) {
      BarcodeScanner.showBackground();
      BarcodeScaner.stopScan();
      onScanEnd();
      return;
    }

    await BarcodeScanner.checkPermission({ force: true });
    BarcodeScanner.hideBackground();

    onScanStart();
    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      console.log(result.content);
      onScanEnd();

      // TODO: validate that we scanned a real address
      navigate(`/wallet/send/${result.content}`);
    }
  };
  return (
    <div className="flex justify-center absolute inset-x-0 bottom-20 mb-1">
      <div className="rounded-full border border-1 border-zinc-300 relative w-24 h-24 bottom-20 bg-zinc-50">
        <button
          className="absolute inset-0"
          type="button"
          onClick={toggleScanner}
        >
          {isScanning ? "Close" : "Open" } Scanner
        </button>
      </div>
    </div>
  );
}

export default ScannerButton;
