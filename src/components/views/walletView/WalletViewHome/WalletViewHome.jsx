import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";

import {
  SnippetsFilled,
  FormOutlined,
  CopyOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import AddressManagerService from "@/services/AddressManagerService";
import WalletViewButtons from "../WalletViewButtons/WalletViewButtons";
import ScannerOverlay from "../ScannerOverlay";
import SatoshiInput from "@/components/atoms/SatoshiInput";
import Address from "@/components/atoms/Address";
import CurrencySymbol from "@/components/atoms/CurrencySymbol";
import CurrencyFlip from "@/components/atoms/CurrencyFlip";

import showToast from "@/util/toast";
import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

const { copiedAddress, requestAmount } = translations;

export default function WalletViewHome() {
  const wallet = useSelector(selectActiveWallet);
  const keyboardIsOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);

  const preferences = useSelector(selectPreferences);

  //const [skip, setSkip] = useState(0);
  const skip = 0;
  const [shouldShowRequestAmount, setShouldShowRequestAmount] = useState(false);
  const [satoshiInput, setSatoshiInput] = useState({ display: "0", sats: 0 });

  const unusedAddresses = useMemo(
    () => new AddressManagerService(wallet.id).getUnusedAddresses(),
    [wallet]
  );

  const address =
    unusedAddresses.length > 0
      ? unusedAddresses[(0 + skip) % unusedAddresses.length].address
      : "";

  const qrRequest =
    shouldShowRequestAmount && satoshiInput.sats > 0
      ? `${address}?amount=${satsToBch(satoshiInput.sats)}`
      : address;

  //const skipAddress = () => setSkip((skip + 1) % 5);

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const copyAddressToClipboard = async () => {
    const titleTranslation = translate(copiedAddress);

    showToast({
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      title: titleTranslation,
      description: (
        <span className="inline-block max-w-[62%] truncate text-sm break-all">
          {qrRequest}
        </span>
      ),
    });
    await Clipboard.write({ string: qrRequest });
  };

  const handleRequestAmountChange = (satInput) => {
    setSatoshiInput(satInput);
  };

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

  return (
    <>
      {isScanning ? (
        <ScannerOverlay />
      ) : (
        <div className="py-3 px-2 flex flex-col items-center">
          <button
            type="button"
            className="w-fit h-fit border border-4 border-primary/80 cursor-pointer shadow active:shadow-none active:bg-primary active:shadow-inner"
            onClick={copyAddressToClipboard}
          >
            <QRCode
              value={qrRequest}
              size={204}
              quietZone={16}
              bgColor={preferences.qrCodeBackground}
              fgColor={preferences.qrCodeForeground}
              logoImage={getQrLogoImage(preferences.qrCodeLogo)}
              logoWidth={60}
              logoHeight={60}
            />
          </button>

          <button
            type="button"
            onClick={copyAddressToClipboard}
            className="w-fit mx-auto text-xs font-mono text-center cursor-pointer text-primary slashed-zero select-none my-2 rounded p-1 shadow-sm my-2 active:bg-primary active:text-white active:shadow-none active:shadow-inner"
          >
            <CopyOutlined className="mr-1" />
            <Address address={address} />
          </button>

          <div className="mt-2 mx-auto select-none opacity-90">
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
                    scaleY: shouldShowRequestAmount ? 0 : 1,
                    scaleX: shouldShowRequestAmount ? 0.5 : 1,
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
              className="bg-primary text-white p-1.5 shadow-sm rounded min-w-[200px] w-fit max-w-[20.5em] mx-auto flex items-center"
              style={{ ...requestOpenSprings }}
            >
              {shouldShowRequestAmount && (
                <>
                  <CurrencySymbol className="text-xl font-bold font-mono px-0.5" />
                  <SatoshiInput
                    onChange={handleRequestAmountChange}
                    satoshiInput={satoshiInput}
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
      {!keyboardIsOpen && (
        <div className="absolute bottom-[4.75em] w-full">
          <WalletViewButtons />
        </div>
      )}
    </>
  );
}
