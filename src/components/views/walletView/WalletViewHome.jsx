import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";
import { useLongPress } from "use-long-press";

import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";
import {
  selectScannerIsScanning,
  selectDeviceInfo,
  selectKeyboardIsOpen,
} from "@/redux/device";

import AddressManagerService from "@/services/AddressManagerService";
import SendWidget from "./SendWidget";
import ScannerButton from "./ScannerButton";
import ScannerOverlay from "./ScannerOverlay";
import SatoshiInput from "@/components/atoms/SatoshiInput";
import HrLabel from "@/components/atoms/HrLabel";
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

export default function WalletViewHome() {
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);
  const keyboardIsOpen = useSelector(selectKeyboardIsOpen);
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
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      title: "Copied Address to Clipboard",
      description: `${qrInvoice}`,
    });
    await Clipboard.write({ string: qrInvoice });
  };

  const skipAddress = () => setSkip((skip + 1) % 5);

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const bindLongPress = useLongPress(() => {
    copyAddressToClipboard();
  });

  const handleInvoiceAmountChange = (satoshis) => {
    setInvoiceSats(satoshis);
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <>
      {isScanning ? (
        <ScannerOverlay />
      ) : (
        <>
          <div className="py-3 px-2 max-w-fit mx-auto">
            <div className="flex justify-center">
              <button
                className="w-fit h-fit border border-4 border-primary/80 cursor-pointer shadow active:shadow-none active:bg-primary active:shadow-inner"
                onClick={copyAddressToClipboard}
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
              </button>
              <div className="flex flex-col justify-around ml-5">
                <Button
                  icon={HistoryOutlined}
                  label="History"
                  onClick={handleHistoryButton}
                  size="12"
                  iconSize="xl"
                  labelSize="xs"
                />
                {/*<Button
                  icon={UnorderedListOutlined}
                  label="Coins"
                  size="12"
                  iconSize="xl"
                  labelSize="xs"
                />*/}
                <Button
                  icon={FormOutlined}
                  label="Invoice"
                  onClick={() => setShowInvoiceAmount(!showInvoiceAmount)}
                  size="12"
                  iconSize="xl"
                  labelSize="xs"
                  inverted={showInvoiceAmount}
                />
              </div>
            </div>
            {showInvoiceAmount && (
              <div className="mt-2 text-white">
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
              className="text-xs font-mono text-center break-all cursor-pointer text-primary slashed-zero select-none my-2 border border-primary/80 rounded p-1 shadow-sm my-2 active:bg-primary active:text-white active:shadow-none active:shadow-inner"
            >
              {formattedAddress}
            </div>
          </div>
        </>
      )}
      {!keyboardIsOpen && (
        <div className="fixed bottom-20 w-full">
          <SendWidget />
        </div>
      )}
    </>
  );
}
