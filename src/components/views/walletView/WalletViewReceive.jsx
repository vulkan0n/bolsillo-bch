import { useState } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";
import WalletService from "@/services/WalletService";

function WalletViewReceive() {
  // TODO: fetch active wallet from user preferences/DB
  const activeWalletKey = "Selene Default";
  const wallet = new WalletService().loadWallet(activeWalletKey);

  const [skip, setSkip] = useState(0);
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
    <div className="py-2">
      <div className="flex justify-center">
        <QRCode value={address} size={200} quietZone={16} />
      </div>
      <div
        onClick={copyAddressToClipboard}
        className="text-sm text-center break-all cursor-pointer"
      >
        {formattedAddress}
      </div>
      <div className="flex justify-center my-1">
        <button className="btn btn-xs" type="button" onClick={skipAddress}>
          Cycle Address
        </button>
      </div>
    </div>
  );
}

export default WalletViewReceive;
