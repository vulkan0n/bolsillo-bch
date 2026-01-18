import { QRCode } from "react-qrcode-logo";
import { useSelector } from "react-redux";

import { selectBchNetwork, selectQrCodeSettings } from "@/redux/preferences";

import Overlay from "@/atoms/Overlay";

import { useClipboard } from "@/hooks/useClipboard";

import { logos } from "@/util/logos";
import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

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
  const bchNetwork = useSelector(selectBchNetwork);
  const qrCodeSettings = useSelector(selectQrCodeSettings);

  const { handleCopyToClipboard } = useClipboard();
  const copyAddress = () => {
    handleCopyToClipboard(address, translate(translations.copiedAddress));
  };

  const qrLogoImage = isTokenAddress
    ? logos[qrCodeSettings.logo.toLowerCase()].img_tokens
    : logos[qrCodeSettings.logo.toLowerCase()].img;

  // Force red border/bg for non-mainnet
  const isTestnet = bchNetwork !== "mainnet";
  const qrBgColor = isTestnet ? "#ffffff" : qrCodeSettings.background;
  const qrFgColor = isTestnet ? "#000000" : qrCodeSettings.foreground;

  return (
    <Overlay className="items-center justify-center">
      {/* Backdrop - tap to close */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* QR Card - designed for nice screenshot dimensions */}
      <div className="relative z-10 flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl">
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
      </div>
    </Overlay>
  );
}
