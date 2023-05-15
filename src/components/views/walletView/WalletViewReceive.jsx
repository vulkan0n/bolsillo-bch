import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";
import { useLongPress } from "use-long-press";

import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";
import { selectScannerIsScanning } from "@/redux/device";

import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";
import ScannerButton from "./ScannerButton";
import SatoshiInput from "@/components/atoms/SatoshiInput";

import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

import {
  FormOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

export default function WalletViewReceive() {
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);
  const isScanning = useSelector(selectScannerIsScanning);

  const [skip, setSkip] = useState(0);
  const [invoiceSats, setInvoiceSats] = useState("0");
  const [showInvoiceAmount, setShowInvoiceAmount] = useState(false);

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

  const qrInvoice =
    showInvoiceAmount && invoiceSats > 0
      ? `${address}?amount=${satsToBch(invoiceSats)}`
      : address;

  const copyAddressToClipboard = async () => {
    await Clipboard.write({ string: qrInvoice });
  };

  const skipAddress = () => setSkip((skip + 1) % 5);

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const bindLongPress = useLongPress(() => {
    console.log("long press detected");
  });

  const handleInvoiceAmountChange = (satoshis) => {
    setInvoiceSats(satoshis);
  };

  return (
    <>
      {!isScanning && (
        <>
          <div className="py-2 z-40">
            <div className="flex justify-center">
              <div
                className="border border-4 border-zinc-300 my-2 cursor-pointer"
                onClick={copyAddressToClipboard}
                {...bindLongPress()}
              >
                <QRCode
                  value={qrInvoice}
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
              className="text-xs text-center break-all cursor-pointer text-primary opacity-70 slashed-zero"
            >
              {formattedAddress}
            </div>
          </div>
          <div className="mx-8">
            <div className="flex justify-evenly">
              <div
                className={`${
                  showInvoiceAmount ? "bg-primary text-white rounded-t" : ""
                }`}
              >
                <button
                  className="w-full h-full py-1 px-2"
                  type="button"
                  onClick={() => setShowInvoiceAmount(!showInvoiceAmount)}
                >
                  <FormOutlined className="text-2xl opacity-80" />
                </button>
              </div>
              {/*<button className="" type="button">
                <UnorderedListOutlined className="text-2xl opacity-80" />
              </button>*/}
              <button className="" type="button" onClick={skipAddress}>
                <ReloadOutlined className="text-2xl opacity-80" />
              </button>
            </div>
            {showInvoiceAmount && (
              <div className="p-1 shadow-sm bg-primary text-white rounded-sm w-5/6 mx-auto">
                <SatoshiInput
                  className="p-1 text-sm w-full text-secondary font-mono rounded opacity-80 mx-1"
                  onChange={handleInvoiceAmountChange}
                  sats={invoiceSats}
                  allowFiat
                />
              </div>
            )}
          </div>
        </>
      )}
      <ScannerButton />
    </>
  );
}
