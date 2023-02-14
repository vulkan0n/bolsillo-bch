/*
 * TODO:
 * 1. Get address from wallet manager
 * 2. Generate QR code
 * 3. Capacitor camera
 * 4. Scanner long press
 * 5. Capacitor clipboard
 */

function MainViewReceive() {
  const copyAddressToClipboard = () => {
    console.log("copying address to clipboard");
    return;
  };

  const openScanner = () => {
    console.log("opening scanner");
    return;
  };

  return (
    <div>
      <div>QR Code Here</div>
      <div onClick={copyAddressToClipboard}>
        bitcoincash:qzx12s4ld323luj32u32io20fh2abf8
      </div>
      <div onClick={openScanner}>Scanner</div>
    </div>
  );
}

export default MainViewReceive;
