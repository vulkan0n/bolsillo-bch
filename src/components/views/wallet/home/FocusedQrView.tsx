import { QRCode } from "react-qrcode-logo";
import { useSelector } from "react-redux";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router";

import { selectBchNetwork, selectQrCodeSettings } from "@/redux/preferences";
// import { setPreference } from "@/redux/preferences";

// import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import translations from "@/views/wallet/translations";
import Address from "@/atoms/Address";
import Modal from "@/atoms/Modal";
import Satoshi from "@/atoms/Satoshi";

import { useClipboard } from "@/hooks/useClipboard";

import { logos } from "@/util/logos";
import { validateBip21Uri } from "@/util/uri";

import { translate } from "@/util/translations";

interface FocusedQrViewProps {
  qrRequest: string;
  onClose: () => void;
}

export default function FocusedQrView({
  qrRequest,
  onClose,
}: FocusedQrViewProps) {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  const bchNetwork = useSelector(selectBchNetwork);
  const qrCodeSettings = useSelector(selectQrCodeSettings);

  const { address, satoshis, isTokenAddress } = validateBip21Uri(qrRequest);

  const { handleCopyToClipboard } = useClipboard();
  const copyAddress = () => {
    handleCopyToClipboard(qrRequest, translate(translations.copiedAddress));
  };

  // const enterVendorMode = async () => {
  //   const isAuthorized = await SecurityService().authorize(
  //     AuthActions.VendorMode
  //   );
  //   if (!isAuthorized) {
  //     return;
  //   }
  //
  //   dispatch(setPreference({ key: "vendorModeActive", value: "true" }));
  //   navigate("/vendor");
  // };

  const qrLogoImage = isTokenAddress
    ? logos[qrCodeSettings.logo.toLowerCase()].img_tokens
    : logos[qrCodeSettings.logo.toLowerCase()].img;

  // Force red border/bg for non-mainnet
  const isTestnet = bchNetwork !== "mainnet";
  const qrBgColor = isTestnet ? "#ffffff" : qrCodeSettings.background;
  const qrFgColor = isTestnet ? "#000000" : qrCodeSettings.foreground;

  return (
    <Modal onClose={onClose} className="text-center">
      {satoshis && (
        <div className="mt-1">
          <div className="font-bold text-2xl">
            {translate(translations.requestAmount)}
          </div>
          <div className="font-bold text-2xl">
            <Satoshi value={satoshis} forceVisible />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={copyAddress}
        className={`mx-4 my-2 border-4 cursor-pointer active:scale-[0.98] ${isTestnet ? "border-[#ff0000]" : "border-primary-700 dark:border-primarydark-200"}`}
      >
        <QRCode
          value={qrRequest}
          size={280}
          quietZone={16}
          bgColor={qrBgColor}
          fgColor={qrFgColor}
          logoImage={qrLogoImage}
          logoWidth={72}
          logoHeight={72}
        />
      </button>

      <div className="w-full p-1 text-sm">
        <button
          type="button"
          onClick={copyAddress}
          className="cursor-pointer active:text-neutral-600 dark:active:text-neutral-300"
        >
          <Address address={address} className="break-all" />
        </button>
      </div>
    </Modal>
  );
}
