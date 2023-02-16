import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";

function WalletViewReceive({ address }) {
  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: address });
  };

  return (
    <div>
      <div>
        <QRCode value={address} />
      </div>
      <div onClick={copyAddressToClipboard}>{address}</div>
    </div>
  );
}

export default WalletViewReceive;
