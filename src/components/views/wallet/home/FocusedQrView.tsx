import { QRCode } from "react-qrcode-logo";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import {
  selectBchNetwork,
  selectQrCodeSettings,
  setPreference,
} from "@/redux/preferences";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import translations from "@/views/wallet/translations";
import Modal from "@/atoms/Modal";

import { useClipboard } from "@/hooks/useClipboard";

import { logos } from "@/util/logos";

import { translate } from "@/util/translations";

interface FocusedQrViewProps {
  address: string;
  isTokenAddress: boolean;
  onClose: () => void;
}

export default function FocusedQrView({
  address,
  isTokenAddress,
  onClose,
}: FocusedQrViewProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bchNetwork = useSelector(selectBchNetwork);
  const qrCodeSettings = useSelector(selectQrCodeSettings);

  const { handleCopyToClipboard } = useClipboard();
  const copyAddress = () => {
    handleCopyToClipboard(address, translate(translations.copiedAddress));
  };

  const enterVendorMode = async () => {
    const isAuthorized = await SecurityService().authorize(
      AuthActions.VendorMode
    );
    if (!isAuthorized) {
      return;
    }

    dispatch(setPreference({ key: "vendorModeActive", value: "true" }));
    navigate("/vendor");
  };

  const qrLogoImage = isTokenAddress
    ? logos[qrCodeSettings.logo.toLowerCase()].img_tokens
    : logos[qrCodeSettings.logo.toLowerCase()].img;

  // Force red border/bg for non-mainnet
  const isTestnet = bchNetwork !== "mainnet";
  const qrBgColor = isTestnet ? "#ffffff" : qrCodeSettings.background;
  const qrFgColor = isTestnet ? "#000000" : qrCodeSettings.foreground;

  return (
    <Modal onClose={onClose}>
      {/* QR Code */}
      <button
        type="button"
        onClick={copyAddress}
        className={`border-4 cursor-pointer active:scale-[0.98] ${isTestnet ? "border-[#ff0000]" : "border-primary-700 dark:border-primarydark-200"}`}
      >
        <QRCode
          value={address}
          size={280}
          quietZone={16}
          bgColor={qrBgColor}
          fgColor={qrFgColor}
          logoImage={qrLogoImage}
          logoWidth={72}
          logoHeight={72}
        />
      </button>

      {/* Address */}
      <button
        type="button"
        onClick={copyAddress}
        className="mt-4 text-xs text-center font-mono text-neutral-500 dark:text-neutral-400 break-all max-w-[280px] cursor-pointer active:text-neutral-600 dark:active:text-neutral-300"
      >
        {address}
      </button>

      {/* Warning */}
      <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-300 max-w-[280px]">
        {translate(translations.focusedQrWarning)}
      </div>

      {/* Vendor Mode Button */}
      <button
        type="button"
        onClick={enterVendorMode}
        className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primarydark-400 text-white rounded-lg text-sm font-medium active:bg-primary-700 dark:active:bg-primarydark-500"
      >
        {translate(translations.vendorMode)}
      </button>
    </Modal>
  );
}
