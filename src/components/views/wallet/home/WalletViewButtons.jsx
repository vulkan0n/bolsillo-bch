import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { SendOutlined, HistoryOutlined } from "@ant-design/icons";
import { selectScannerIsScanning } from "@/redux/device";

import Button from "@/atoms/Button";
import ScannerButton from "./ScannerButton";
import TorchButton from "./TorchButton";
import ImageSelectButton from "./ImageSelectButton";

import { useClipboard } from "@/hooks/useClipboard";
import NotificationService from "@/kernel/app/NotificationService";
import { navigateOnValidUri } from "@/util/uri";
import { extractBchAddresses } from "@/util/cashaddr";

import translations from "@/views/wallet/translations";
import { translate } from "@/util/translations";

export default function WalletViewButtons() {
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const { getClipboardContents } = useClipboard();

  const forwardOnValidAddress = async (input) => {
    const extracted = extractBchAddresses(input)[0] || input;
    const { navTo, navState, isExpired } = await navigateOnValidUri(extracted);
    if (isExpired) {
      NotificationService().expiredPayment();
    } else if (navTo) {
      navigate(navTo, { state: navState });
    }
  };

  const pasteAddressFromClipboard = async () => {
    const { paste, spawnPasteToast } = await getClipboardContents();
    const extracted = extractBchAddresses(paste)[0] || paste;
    const { navTo, navState, isExpired } = await navigateOnValidUri(extracted);
    if (isExpired) {
      NotificationService().expiredPayment();
    } else if (navTo !== "") {
      spawnPasteToast();
      navigate(navTo, { state: navState });
    } else {
      navigate("/wallet/send/");
    }
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <div className="flex items-center w-auto mx-4 my-3 justify-evenly relative z-40">
      {isScanning ? (
        <ImageSelectButton
          iconSize="2xl"
          outerLabelColor="text-white/80"
          onSelection={forwardOnValidAddress}
        />
      ) : (
        <Button
          icon={HistoryOutlined}
          outerLabel={translate(translations.history)}
          onClick={handleHistoryButton}
          iconSize="2xl"
        />
      )}
      <ScannerButton />
      {isScanning ? (
        <TorchButton iconSize="2xl" outerLabelColor="text-white/80" />
      ) : (
        <Button
          icon={SendOutlined}
          outerLabel={translate(translations.send)}
          onClick={pasteAddressFromClipboard}
          iconSize="2xl"
        />
      )}
    </div>
  );
}
