import { useState } from "react";
import { Clipboard } from "@capacitor/clipboard";
/*
 * TODO:
 * 1. Get address from wallet manager
 * 2. Generate QR code
 * 3. Capacitor camera
 * 4. Scanner long press
 * 5. Capacitor clipboard
 */

function WalletViewReceive({ addresses }) {
  const [addressIndex, setAddressIndex] = useState(0);

  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: addresses[addressIndex] });
  };

  const openScanner = () => {
    console.log("opening scanner");
    return;
  };

  const regenerateAddress = () =>
    setAddressIndex((addressIndex + 1) % addresses.length);

  return (
    <div>
      <div>QR Code Here</div>
      <div onClick={copyAddressToClipboard}>{addresses[addressIndex]}</div>
      <div onClick={regenerateAddress}>
        <button>Cycle Address</button>
      </div>
      <div onClick={openScanner}>Scanner</div>
    </div>
  );
}

export default WalletViewReceive;
