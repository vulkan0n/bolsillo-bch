import { useState } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";

import WalletService from "@/services/WalletService";
import ScannerButton from "./ScannerButton";

function WalletViewReceive() {
  // TODO: fetch active wallet from user preferences/DB
  const activeWalletKey = "Selene Default";
  const wallet = new WalletService().loadWallet(activeWalletKey);

  const [skip, setSkip] = useState(0);
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const address = wallet.generateAddress(0 + skip);
  const formattedAddress = (() => {
    const split = address.split(":");
    return split.length > 1 ? split[1] : split[0];
  })();

  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: address });
  };

  const skipAddress = () => setSkip((skip + 1) % 5);

  return (
    <>
      {!isScanning && (
        <>
          <div className="py-2">
            <div className="flex justify-center">
              <div className="border border-4 border-zinc-300 my-2">
                <QRCode value={address} size={200} quietZone={16} />
              </div>
            </div>
            <div
              onClick={copyAddressToClipboard}
              className="text-xs text-center break-all cursor-pointer text-primary"
            >
              {formattedAddress}
            </div>
          </div>
          <div className="flex justify-center gap-x-6">
            <button className="btn btn-xs" type="button">
              Request Amount
            </button>
            <button className="btn btn-xs" type="button" onClick={skipAddress}>
              Cycle Address
            </button>
          </div>
        </>
      )}
      <ScannerButton
        onScanStart={() => setIsScanning(true)}
        onScanEnd={() => setIsScanning(false)}
      />
    </>
  );
}

export default WalletViewReceive;
