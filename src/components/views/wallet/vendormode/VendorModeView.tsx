import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { QRCode } from "react-qrcode-logo";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { KeepAwake } from "@capacitor-community/keep-awake";

import { selectActiveWalletHash } from "@/redux/wallet";
import {
  selectBchNetwork,
  selectQrCodeSettings,
  selectIsVendorModeKeepAwake,
  selectShouldUseLegacyBip21,
  setPreference,
} from "@/redux/preferences";
import { selectDeviceInfo } from "@/redux/device";

import AddressManagerService from "@/kernel/wallet/AddressManagerService";
import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import Satoshi from "@/atoms/Satoshi";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";
import { useLongPress } from "@/hooks/useLongPress";
import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";
import { toAlphanumericUri } from "@/util/uri";
import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

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
    if (satoshiAmount === 0n) return address;
    if (shouldUseLegacyBip21) {
      return `${address}?amount=${satsToBch(satoshiAmount).bch}`;
    }
    return toAlphanumericUri(`${address}?s=${satoshiAmount}`);
  }, [address, satoshiAmount, shouldUseLegacyBip21]);

  const qrLogoImage = logos[qrCodeSettings.logo.toLowerCase()].img;

  const handleCurrencyFlip = useCurrencyFlip();

  // Dynamic font size based on display length
  const getAmountFontSize = (): string => {
    const bchString = satsToBch(satoshiAmount).bch.toString();
    const len = bchString.length;
    if (len > 16) return "text-2xl";
    if (len > 12) return "text-3xl";
    return "text-4xl";
  };

  // Exit vendor mode
  const exitVendorMode = async () => {
    const isAuthorized = await SecurityService().authorize(
      AuthActions.VendorMode
    );
    if (!isAuthorized) return;

    dispatch(setPreference({ key: "vendorModeActive", value: "false" }));
    navigate("/wallet");
  };

  const qrLongPress = useLongPress(exitVendorMode, () => {}, 1000);

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
    <div className="flex h-full w-full bg-white dark:bg-neutral-900">
      {/* Left side - QR Code */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <button
          type="button"
          className={`border-4 cursor-pointer ${isTestnet ? "border-[#ff0000]" : "border-primary-700 dark:border-primarydark-200"}`}
          {...qrLongPress}
        >
          <QRCode
            value={qrValue}
            size={240}
            quietZone={12}
            bgColor={qrBgColor}
            fgColor={qrFgColor}
            logoImage={qrLogoImage}
            logoWidth={56}
            logoHeight={56}
          />
        </button>

        {/* Amount display */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleCurrencyFlip}
            className={`${getAmountFontSize()} font-bold text-neutral-800 dark:text-neutral-100 flex items-center justify-center gap-3 cursor-pointer`}
          >
            <Satoshi value={satoshiAmount} forceVisible />
            <CurrencyFlip className="text-lg text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Right side - Numpad */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xs h-full max-h-80">
          <VendorNumpad onChange={setSatoshiAmount} />
        </div>
        {/* Long press hint */}
        <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          {translate(translations.vendorModeExitHint)}
        </div>
      </div>
    </div>
  );
}
