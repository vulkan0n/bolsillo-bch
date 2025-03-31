import { useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  encodeCashAddress,
  decodeCashAddress,
  CashAddressType,
  assertSuccess,
} from "@bitauth/libauth";

import { QRCode } from "react-qrcode-logo";
import {
  FormOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { selectActiveWalletHash } from "@/redux/wallet";
import { selectIsSyncing } from "@/redux/sync";
import {
  selectBchNetwork,
  selectQrCodeSettings,
  selectShouldUseTokenAddress,
  setPreference,
} from "@/redux/preferences";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";

import AddressManagerService from "@/services/AddressManagerService";

import FullColumn from "@/layout/FullColumn";
import { SatoshiInput } from "@/atoms/SatoshiInput";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import WalletViewButtons from "../WalletViewButtons/WalletViewButtons";
import ScannerOverlay from "../ScannerOverlay";

import { useClipboard } from "@/hooks/useClipboard";

import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewHome() {
  const dispatch = useDispatch();

  const walletHash = useSelector(selectActiveWalletHash);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);

  const qrCodeSettings = useSelector(selectQrCodeSettings);
  const bchNetwork = useSelector(selectBchNetwork);

  const isSyncing = useSelector(selectIsSyncing);

  const shouldUseTokenAddress = useSelector(selectShouldUseTokenAddress);
  const setShouldUseTokenAddress = (mode) =>
    dispatch(setPreference({ key: "useTokenAddress", value: mode }));

  const AddressManager = useMemo(
    () => AddressManagerService(walletHash),
    [walletHash]
  );
  const unusedAddressesRef = useRef(AddressManager.getUnusedAddresses());

  // only re-render when isSyncing changes
  const unusedAddresses = useMemo(() => {
    if (!isSyncing) {
      unusedAddressesRef.current = AddressManager.getUnusedAddresses();
    }

    return unusedAddressesRef.current;
  }, [AddressManager, isSyncing]);

  // currently displayed address
  const address = useMemo(() => {
    const standardAddress =
      unusedAddresses.length > 0 ? unusedAddresses[0].address : "";

    // convert address to cashtokens address
    if (shouldUseTokenAddress) {
      const { payload, prefix } = assertSuccess(
        decodeCashAddress(standardAddress)
      );
      const { address: tokenAddress } = assertSuccess(
        encodeCashAddress({
          prefix,
          type: CashAddressType.p2pkhWithTokens,
          payload,
        })
      );

      return tokenAddress;
    }

    return standardAddress;
  }, [unusedAddresses, shouldUseTokenAddress]);

  // "Request Amount" state
  const [shouldShowRequestAmount, setShouldShowRequestAmount] = useState(false);
  const [satoshiInput, setSatoshiInput] = useState(0);

  const handleRequestAmountChange = (satInput) => {
    setSatoshiInput(satInput);
  };

  // generate bip21 uri for QR code
  const qrRequest = useMemo(
    () =>
      shouldShowRequestAmount && satoshiInput > 0
        ? `${address}?amount=${satsToBch(satoshiInput).bch}`
        : address,
    [shouldShowRequestAmount, satoshiInput, address]
  );

  const qrLogoImage = useMemo(() => {
    const logo = qrCodeSettings.logo.toLowerCase();
    return shouldUseTokenAddress ? logos[logo].img_tokens : logos[logo].img;
  }, [shouldUseTokenAddress, qrCodeSettings.logo]);

  const { handleCopyToClipboard } = useClipboard();
  const copyAddressToClipboard = async () => {
    handleCopyToClipboard(qrRequest, translate(translations.copiedAddress));
  };

  // force red QR code border if connected to chipnet
  const qrCodeBorder =
    bchNetwork !== "mainnet" ? "border-[#ff0000]" : "border-primary";
  const addressColor =
    bchNetwork !== "mainnet" ? "text-[#ff0000]" : "text-white/80";

  return isScanning ? (
    <ScannerOverlay />
  ) : (
    <FullColumn className="justify-between">
      <div className="font-mono text-white/90">
        <div className="w-full mx-auto bg-primary/90">
          <div className="py-1 flex justify-center items-center text-sm text-center uppercase">
            Receive
          </div>
          <div className="w-fit mx-auto">
            <button
              type="button"
              className={`border-4 cursor-pointer active:bg-primary shadow-inner shadow-lg active:shadow-none active:shadow-inner active:scale-[0.98] ${qrCodeBorder}`}
              onClick={copyAddressToClipboard}
            >
              <QRCode
                value={qrRequest}
                size={232}
                quietZone={12}
                bgColor={
                  bchNetwork !== "mainnet"
                    ? "#ffffff"
                    : qrCodeSettings.background
                }
                fgColor={
                  bchNetwork !== "mainnet"
                    ? "#000000"
                    : qrCodeSettings.foreground
                }
                logoImage={qrLogoImage}
                logoWidth={64}
                logoHeight={64}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={copyAddressToClipboard}
            className="flex items-center justify-center w-full py-2 text-xs text-center cursor-pointer slashed-zero select-none active:bg-secondary active:shadow-inner"
          >
            <CopyOutlined className={`mr-0.5 ${addressColor}`} />
            <Address address={address} color={addressColor} />
          </button>
        </div>
        <div className="flex justify-evenly items-center rounded-b-sm text-sm">
          <div
            className={`font-sans bg-primary flex-1 px-1 py-1.5 text-nowrap truncate ${!shouldShowRequestAmount ? "active:bg-secondary active:shadow-inner" : ""}`}
            onClick={() =>
              !shouldShowRequestAmount && setShouldShowRequestAmount(true)
            }
          >
            {shouldShowRequestAmount ? (
              <div className="flex w-full justify-between items-center">
                <CloseOutlined
                  className="p-1 font-bold text-lg"
                  onClick={() => setShouldShowRequestAmount(false)}
                />
                <span className="flex text-center grow items-center ml-1">
                  <CurrencySymbol className="text-lg bg-white/60 rounded-l px-1 text-zinc-500/80 font-semibold font-mono" />
                  <SatoshiInput
                    satoshis={satoshiInput}
                    onChange={handleRequestAmountChange}
                    className="p-1 mr-1 w-full text-black/70 font-mono rounded-r "
                    autoFocus
                  />
                  <div className="flex items-center justify-center">
                    <CurrencyFlip className="text-xl p-1" />
                  </div>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center cursor-pointer">
                <FormOutlined className="mr-1 font-bold" />
                <span className="truncate">
                  {translate(translations.requestAmount)}
                </span>
                {shouldShowRequestAmount ? (
                  <CaretDownOutlined className="ml-1" />
                ) : (
                  <CaretRightOutlined className="ml-1" />
                )}
              </div>
            )}
          </div>
          {!shouldShowRequestAmount && (
            <label
              className={`font-sans ${shouldUseTokenAddress ? "bg-secondary" : "bg-primary"} px-2 py-1.5 border-l border-white/20`}
            >
              Receive Tokens{" "}
              <input
                type="checkbox"
                checked={shouldUseTokenAddress}
                onChange={() =>
                  setShouldUseTokenAddress(!shouldUseTokenAddress)
                }
              />
            </label>
          )}
        </div>
      </div>
      {!isKeyboardOpen && <WalletViewButtons />}
    </FullColumn>
  );
}
