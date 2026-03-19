import { useEffect, useMemo, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useDispatch, useSelector } from "react-redux";
import { useBlocker, useNavigate } from "react-router";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { CloseOutlined } from "@ant-design/icons";

import { selectDeviceInfo } from "@/redux/device";
import {
  selectBchNetwork,
  selectIsVendorModeKeepAwake,
  selectQrCodeSettings,
  selectShouldUseLegacyBip21,
  setPreference,
} from "@/redux/preferences";
import { selectActiveWalletHash } from "@/redux/wallet";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import AddressManagerService from "@/kernel/wallet/AddressManagerService";

import CurrencyFlip from "@/atoms/CurrencyFlip";
import Satoshi from "@/atoms/Satoshi";

import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";

import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";
import { toAlphanumericUri } from "@/util/uri";

import VendorNumpad from "./VendorNumpad";

export default function VendorModeView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const walletHash = useSelector(selectActiveWalletHash);
  const bchNetwork = useSelector(selectBchNetwork);
  const qrCodeSettings = useSelector(selectQrCodeSettings);
  const deviceInfo = useSelector(selectDeviceInfo);
  const isKeepAwake = useSelector(selectIsVendorModeKeepAwake);
  const shouldUseLegacyBip21 = useSelector(selectShouldUseLegacyBip21);

  // Get receive address
  const AddressManager = useMemo(
    () => AddressManagerService(walletHash),
    [walletHash]
  );
  const address = useMemo(
    () => AddressManager.getUnusedAddresses(1)[0].address,
    [AddressManager]
  );

  // Amount state (in satoshis)
  const [satoshiAmount, setSatoshiAmount] = useState(0n);

  // Generate BIP21 URI for QR code
  // PayPro CHIP-2023-05: use ?s= (satoshis) by default, ?amount= (BCH) for legacy
  // PayPro format uses alphanumeric encoding for more efficient QR codes
  const qrValue = useMemo(() => {
    if (satoshiAmount === 0n) {
      return address;
    }
    if (shouldUseLegacyBip21) {
      return `${address}?amount=${satsToBch(satoshiAmount).bch}`;
    }
    return toAlphanumericUri(`${address}?s=${satoshiAmount}`);
  }, [address, satoshiAmount, shouldUseLegacyBip21]);

  const qrLogoImage = logos[qrCodeSettings.logo.toLowerCase()].img;

  const handleCurrencyFlip = useCurrencyFlip();

  // Block navigation out of vendor mode until auth passes
  const blocker = useBlocker(true);

  useEffect(
    function handleVendorModeExit() {
      if (blocker.state !== "blocked") {
        return;
      }

      SecurityService()
        .authorize(AuthActions.VendorMode)
        .then((isAuthorized) => {
          if (isAuthorized) {
            dispatch(
              setPreference({ key: "vendorModeActive", value: "false" })
            );
            blocker.proceed();
          } else {
            blocker.reset();
          }
        });
    },
    [blocker, dispatch]
  );

  const exitVendorMode = () => navigate("/wallet");

  // Lock orientation and keep awake on mount
  useEffect(
    function handleVendorModeLifecycle() {
      async function setup() {
        if (deviceInfo.platform !== "web") {
          await ScreenOrientation.lock({ orientation: "landscape" });
          if (isKeepAwake) {
            await KeepAwake.keepAwake();
          }
        }
      }
      setup();

      return function cleanup() {
        if (deviceInfo.platform !== "web") {
          ScreenOrientation.unlock();
          KeepAwake.allowSleep();
        }
      };
    },
    [deviceInfo.platform, isKeepAwake]
  );

  const isTestnet = bchNetwork !== "mainnet";
  const qrBgColor = isTestnet ? "#ffffff" : qrCodeSettings.background;
  const qrFgColor = isTestnet ? "#000000" : qrCodeSettings.foreground;

  return (
    <div className="relative flex h-full w-full bg-white dark:bg-neutral-900">
      {/* Exit button */}
      <button
        type="button"
        onClick={exitVendorMode}
        className="absolute top-3 right-3 z-10 p-2 cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        <CloseOutlined className="text-xl" />
      </button>

      {/* Left side - QR Code */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className={`border-4 ${isTestnet ? "border-[#ff0000]" : "border-primary-700 dark:border-primarydark-200"}`}
        >
          <QRCode
            value={qrValue}
            size={200}
            quietZone={12}
            bgColor={qrBgColor}
            fgColor={qrFgColor}
            logoImage={qrLogoImage}
            logoWidth={48}
            logoHeight={48}
          />
        </div>

        {/* Amount display - both currencies, tap to swap */}
        <button
          type="button"
          onClick={handleCurrencyFlip}
          className="mt-4 text-center cursor-pointer"
        >
          <div
            data-testid="vendor-amount"
            className="text-4xl font-bold text-neutral-800 dark:text-neutral-100"
          >
            <Satoshi value={satoshiAmount} forceVisible />
          </div>
          <div className="text-lg text-neutral-500 dark:text-neutral-400 flex items-center justify-center">
            <Satoshi value={satoshiAmount} forceVisible flip />
            <CurrencyFlip className="ml-1.5 text-sm" />
          </div>
        </button>
      </div>

      {/* Right side - Numpad */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xs h-full max-h-80">
          <VendorNumpad onChange={setSatoshiAmount} />
        </div>
      </div>
    </div>
  );
}
