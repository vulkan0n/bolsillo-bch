import { useState } from "react";
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

  const copyAddressToClipboard = () => {
    console.log("copying address to clipboard");
    return;
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
