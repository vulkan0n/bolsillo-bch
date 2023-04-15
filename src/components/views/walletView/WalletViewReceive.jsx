import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";

import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";

import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";
import ScannerButton from "./ScannerButton";

import seleneLogo from "@/assets/selene-logo.png";
import bchLogo from "@/assets/bch-logo.png";

import { FormOutlined, ReloadOutlined, UnorderedListOutlined } from "@ant-design/icons";

function WalletViewReceive() {
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);

  const [skip, setSkip] = useState(0);
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const unusedAddresses = useMemo(
    () => new AddressManagerService(wallet.id).getUnusedAddresses(),
    [wallet]
  );

  const address =
    unusedAddresses.length > 0
      ? unusedAddresses[(0 + skip) % unusedAddresses.length].address
      : "";

  const formattedAddress = (() => {
    const split = address.split(":");
    return split.length > 1 ? split[1] : split[0];
  })();

  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: address });
  };

  const skipAddress = () => setSkip((skip + 1) % 5);

  const getQrLogoImage = (logo) => {
    const logoMap = {
      selene: seleneLogo,
      bch: bchLogo,
      none: "",
    };

    return logo ? logoMap[logo.toLowerCase()] : "";
  };

  return (
    <>
      {!isScanning && (
        <>
          <div className="py-2">
            <div className="flex justify-center">
              <div
                className="border border-4 border-zinc-300 my-2 cursor-pointer"
                onClick={copyAddressToClipboard}
              >
                <QRCode
                  value={address}
                  size={200}
                  quietZone={16}
                  bgColor={preferences["qrCodeBackground"]}
                  fgColor={preferences["qrCodeForeground"]}
                  logoImage={getQrLogoImage(preferences["qrCodeLogo"])}
                  logoWidth={58}
                  logoHeight={58}
                />
              </div>
            </div>
            <div
              onClick={copyAddressToClipboard}
              className="text-xs text-center break-all cursor-pointer text-primary opacity-70"
            >
              {formattedAddress}
            </div>
          </div>
          <div className="flex justify-center gap-x-8 my-1">
            <button className="btn btn-xs" type="button">
              <FormOutlined className="text-2xl" />
            </button>
            <button className="btn btn-xs" type="button">
              <UnorderedListOutlined className="text-2xl" />
            </button>
            <button className="btn btn-xs" type="button" onClick={skipAddress}>
              <ReloadOutlined className="text-2xl" />
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
