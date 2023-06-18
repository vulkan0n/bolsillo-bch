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
import Button from "@/components/atoms/Button";
import Address from "@/components/atoms/Address";

import {
  SnippetsFilled,
  FormOutlined,
  HistoryOutlined,
  CopyOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

import showToast from "@/util/toast";
import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

import { animated, useSpring } from "@react-spring/web";

export default function WalletViewHome() {
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);
  const keyboardIsOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);
  const deviceInfo = useSelector(selectDeviceInfo);

  const [skip, setSkip] = useState(0);
  const [requestSats, setRequestSats] = useState("");
  const [showRequestAmount, setShowRequestAmount] = useState(false);

  const unusedAddresses = useMemo(
    () => new AddressManagerService(wallet.id).getUnusedAddresses(),
    [wallet]
  );

  const address =
    unusedAddresses.length > 0
      ? unusedAddresses[(0 + skip) % unusedAddresses.length].address
      : "";

  const qrRequest =
    showRequestAmount && requestSats > 0
      ? `${address}?amount=${satsToBch(requestSats)}`
      : address;

  const skipAddress = () => setSkip((skip + 1) % 5);

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const copyAddressToClipboard = async () => {
    showToast({
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      title: "Copied Address to Clipboard",
      description: `${qrRequest}`,
    });
    await Clipboard.write({ string: qrRequest });
  };

  const bindLongPress = useLongPress(() => {
    copyAddressToClipboard();
  });

  const handleRequestAmountChange = (satoshis) => {
    setRequestSats(satoshis);
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  const [requestSprings, requestSpringsApi] = useSpring(() => ({
    from: { fontSize: "1em" },
    to: { fontSize: "0.875em" },
    immediate: true,
    config: {
      tension: 500,
      friction: 25,
      mass: 0.8,
    },
  }));

  const [requestOpenSprings, requestOpenSpringsApi] = useSpring(() => ({
    from: { opacity: 0, y: -4 },
    to: { opacity: 1, y: 0, height: 0 },
    config: {
      tension: 500,
      friction: 25,
      mass: 0.8,
    },
    reverse: !showRequestAmount,
    immediate: true,
  }));

  return (
    <>
      {isScanning ? (
        <ScannerOverlay />
      ) : (
        <div className="py-3 px-2 text-center">
          <button
            className="w-fit h-fit border border-4 border-primary/80 cursor-pointer shadow active:shadow-none active:bg-primary active:shadow-inner"
            onClick={copyAddressToClipboard}
          >
            <QRCode
              value={qrRequest}
              size={204}
              quietZone={16}
              bgColor={preferences["qrCodeBackground"]}
              fgColor={preferences["qrCodeForeground"]}
              logoImage={getQrLogoImage(preferences["qrCodeLogo"])}
              logoWidth={60}
              logoHeight={60}
            />
          </button>
          <div
            onClick={copyAddressToClipboard}
            className="w-fit mx-auto text-xs font-mono text-center break-all cursor-pointer text-primary slashed-zero select-none my-2 rounded p-1 shadow-sm my-2 active:bg-primary active:text-white active:shadow-none active:shadow-inner"
          >
            <CopyOutlined className="mr-1" />
            <Address address={address} />
          </div>
          <div className="mt-2 mx-auto select-none opacity-90">
            <animated.div
              className={`py-1.5 px-2 w-max justify-center shadow-sm outline outline-2 outline-primary flex items-center mx-auto cursor-pointer ${
                showRequestAmount
                  ? "rounded-t pb-1 font-semibold bg-primary text-white active:bg-white active:text-primary active:font-normal"
                  : "rounded bg-white text-zinc-600 active:bg-primary active:text-white active:font-semibold"
              } active:shadow-none active:shadow-inner`}
              onClick={() => {
                requestSpringsApi.start({
                  to: showRequestAmount
                    ? { fontSize: "0.875em" }
                    : { fontSize: "1em" },
                });
                requestOpenSpringsApi.start({
                  to: showRequestAmount
                    ? { opacity: 0, height: 0 }
                    : { opacity: 1, height: "max-content" },
                });
                setShowRequestAmount(!showRequestAmount);
              }}
              style={{ ...requestSprings }}
            >
              <FormOutlined className="mr-1" />
              Request Amount
              {showRequestAmount ? (
                <CaretDownOutlined className="ml-1" />
              ) : (
                <CaretRightOutlined className="ml-1" />
              )}
            </animated.div>
            <animated.div
              className="bg-primary text-white p-1.5 shadow-sm rounded max-w-[20.5em] mx-auto"
              style={{ ...requestOpenSprings }}
            >
              {showRequestAmount && (
                <SatoshiInput
                  className="p-1 w-full text-black/70 font-mono rounded mx-1"
                  onChange={handleRequestAmountChange}
                  sats={requestSats}
                  allowFiat
                />
              )}
            </animated.div>
          </div>
        </div>
      )}
      {!keyboardIsOpen && (
        <div className="absolute bottom-[4.75em] w-full">
          <SendWidget />
        </div>
      )}
    </>
  );
}
