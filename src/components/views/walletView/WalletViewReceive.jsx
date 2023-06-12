import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";
import { useLongPress } from "use-long-press";

import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";
import { selectScannerIsScanning, selectDeviceInfo } from "@/redux/device";

import AddressManagerService from "@/services/AddressManagerService";
import SendWidget from "./SendWidget";
import ScannerButton from "./ScannerButton";
import ScannerOverlay from "./ScannerOverlay";
import SatoshiInput from "@/components/atoms/SatoshiInput";
import Button from "@/components/atoms/Button";

import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

import {
  SnippetsFilled,
  FormOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import showToast from "@/util/toast";

export default function WalletViewReceive() {
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);
  const isScanning = useSelector(selectScannerIsScanning);
  const deviceInfo = useSelector(selectDeviceInfo);

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
    showToast({
      icon: <SnippetsFilled className="text-5xl text-primary" />,
      title: "Copied to clipboard",
      description: `${qrInvoice}`,
    });
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
      {isScanning ? (
        <ScannerOverlay />
      ) : (
        <>
          <div className="p-2">
            <div className="flex justify-center">
              <div
                className="w-fit border border-4 border-primary/80 cursor-pointer shadow mx-2"
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
              <div className="flex flex-col justify-around ml-2">
                <Button
                  icon={HistoryOutlined}
                  label="History"
                  onClick={() => null}
                  size="8"
                  iconSize="lg"
                  labelSize="xs"
                />
                <Button
                  icon={UnorderedListOutlined}
                  label="Addresses"
                  size="8"
                  iconSize="lg"
                  labelSize="xs"
                />
                <Button
                  icon={FormOutlined}
                  label="Invoice"
                  onClick={() => setShowInvoiceAmount(!showInvoiceAmount)}
                  size="8"
                  iconSize="lg"
                  labelSize="xs"
                  inverted={showInvoiceAmount}
                />
              </div>
            </div>
            {showInvoiceAmount && (
              <div className="mt-2 text-white w-5/6 mx-auto">
                <div className="p-1 w-fit bg-primary rounded-t-sm font-bold text-sm shadow-sm">
                  Invoice Amount:
                </div>
                <div className="bg-primary p-1 shadow-sm rounded-b-sm rounded-r-sm">
                  <SatoshiInput
                    className="p-1 text-sm w-full text-secondary font-mono rounded opacity-80 mx-1"
                    onChange={handleInvoiceAmountChange}
                    sats={invoiceSats}
                    allowFiat
                  />
                </div>
              </div>
            )}
            <div
              onClick={copyAddressToClipboard}
              className="text-xs font-mono text-center break-all cursor-pointer text-primary opacity-80 slashed-zero select-none my-2"
            >
              {formattedAddress}
            </div>
          </div>
        </>
      )}
      <div className="fixed bottom-24 w-full">
        <SendWidget />
      </div>
    </>
  );
}
