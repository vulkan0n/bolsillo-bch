import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";

import {
  FormOutlined,
  CopyOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { selectActiveWallet } from "@/redux/wallet";
import { selectIsChipnet, selectQrCodeSettings } from "@/redux/preferences";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import AddressManagerService from "@/services/AddressManagerService";
import WalletViewButtons from "../WalletViewButtons/WalletViewButtons";
import ScannerOverlay from "../ScannerOverlay";
import { SatoshiInput } from "@/atoms/SatoshiInput";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import ToastService from "@/services/ToastService";
import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

const { requestAmount } = translations;

export default function WalletViewHome() {
  const wallet = useSelector(selectActiveWallet);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);

  const qrCodeSettings = useSelector(selectQrCodeSettings);
  const isChipnet = useSelector(selectIsChipnet);

  // reload unused addresses when wallet data changes
  const unusedAddresses = useMemo(
    () => AddressManagerService(wallet).getUnusedAddresses(),
    [wallet]
  );

  // currently displayed address
  const address = unusedAddresses.length > 0 ? unusedAddresses[0].address : "";

  // "Request Amount" state
  const [shouldShowRequestAmount, setShouldShowRequestAmount] = useState(false);
  const [satoshiInput, setSatoshiInput] = useState(0);

  const handleRequestAmountChange = (satInput) => {
    setSatoshiInput(satInput);
  };

  // generate bip21 uri for QR code
  const qrRequest =
    shouldShowRequestAmount && satoshiInput > 0
      ? `${address}?amount=${satsToBch(satoshiInput).bch}`
      : address;

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const copyAddressToClipboard = async () => {
    //const titleTranslation = translate(copiedAddress);

    await Clipboard.write({ string: qrRequest });
    ToastService().clipboardCopy("Address", qrRequest);
  };

  // "Request Amount" animations
  const [requestSprings, requestSpringsApi] = useSpring(() => ({
    from: { scale: 1 },
    to: { scale: 0.875 },
    immediate: true,
    config: {
      tension: 150,
      friction: 25,
      mass: 0.8,
    },
  }));

  const [requestOpenSprings, requestOpenSpringsApi] = useSpring(() => ({
    from: { opacity: 1, y: 0, scaleY: 1, scaleX: 1 },
    to: { opacity: 0, y: -16, scaleY: 0, scaleX: 0.5 },
    immediate: true,
    config: {
      tension: 400,
      friction: 60,
      mass: 1,
    },
  }));

  // force red QR code border if connected to chipnet
  const qrCodeBorder = isChipnet ? "border-[#ff0000]" : "border-primary/80";
  const addressColor = isChipnet ? "text-[#ff0000]" : "text-primary";

  return (
    <>
      {isScanning ? (
        <ScannerOverlay />
      ) : (
        <div className="py-3 px-2 flex flex-col items-center">
          <button
            type="button"
            className={`w-fit h-fit border border-4 cursor-pointer shadow active:shadow-none active:bg-primary active:shadow-inner ${qrCodeBorder}`}
            onClick={copyAddressToClipboard}
          >
            <QRCode
              value={qrRequest}
              size={204}
              quietZone={16}
              bgColor={isChipnet ? "#ffffff" : qrCodeSettings.background}
              fgColor={isChipnet ? "#000000" : qrCodeSettings.foreground}
              logoImage={getQrLogoImage(qrCodeSettings.logo)}
              logoWidth={60}
              logoHeight={60}
            />
          </button>

          <button
            type="button"
            onClick={copyAddressToClipboard}
            className={`flex justify-center items-center w-fit mx-auto text-xs font-mono text-center cursor-pointer slashed-zero select-none my-2 rounded p-1 shadow-sm my-2 active:bg-primary active:text-white active:shadow-none active:shadow-inner ${addressColor}`}
          >
            <CopyOutlined className="mr-0.5" />
            <Address address={address} />
          </button>

          <div className="mt-2 mx-auto select-none z-50">
            <animated.div
              className={`py-1.5 px-2 w-max justify-center shadow-sm outline outline-2 outline-primary flex items-center mx-auto cursor-pointer ${
                shouldShowRequestAmount
                  ? "rounded-t pb-1 font-semibold bg-primary text-white active:bg-white active:text-primary active:font-normal"
                  : "rounded bg-white text-zinc-600 active:bg-primary active:text-white active:font-semibold"
              } active:shadow-none active:shadow-inner`}
              onClick={() => {
                requestSpringsApi.start({
                  to: shouldShowRequestAmount ? { scale: 0.875 } : { scale: 1 },
                });
                requestOpenSpringsApi.start({
                  to: {
                    opacity: shouldShowRequestAmount ? 0 : 1,
                    scaleY: shouldShowRequestAmount ? 0 : 1.2,
                    scaleX: shouldShowRequestAmount ? 0.5 : 1.2,
                    y: shouldShowRequestAmount ? -16 : 0,
                  },
                });
                setShouldShowRequestAmount(!shouldShowRequestAmount);
              }}
              style={{ ...requestSprings }}
            >
              <FormOutlined className="mr-1" />
              {translate(requestAmount)}
              {shouldShowRequestAmount ? (
                <CaretDownOutlined className="ml-1" />
              ) : (
                <CaretRightOutlined className="ml-1" />
              )}
            </animated.div>
            <animated.div
              className="bg-primary text-white p-2 shadow-sm rounded min-w-[200px] w-fit max-w-[20.5em] mx-auto flex items-center"
              style={{ ...requestOpenSprings }}
            >
              {shouldShowRequestAmount && (
                <>
                  <CurrencySymbol className="text-xl font-bold font-mono px-0.5" />
                  <SatoshiInput
                    satoshis={satoshiInput}
                    onChange={handleRequestAmountChange}
                    className="p-1 w-fit text-black/70 font-mono rounded mx-1"
                  />
                  <div className="w-6 h-8 flex items-center justify-center">
                    <CurrencyFlip className="text-xl" />
                  </div>
                </>
              )}
            </animated.div>
          </div>
        </div>
      )}
      {!isKeyboardOpen && (
        <div className="absolute bottom-[4.75em] w-full">
          <WalletViewButtons />
        </div>
      )}
    </>
  );
}
