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

  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: address });
  };

  const skipAddress = () => setSkip((skip + 1) % 5);

  return (
    <div>
      <div>
        <QRCode value={address} />
      </div>
      <div onClick={copyAddressToClipboard}>{address}</div>
      <button type="button" onClick={skipAddress}>Cycle Address</button>
    </div>
  );
}

export default WalletViewReceive;
