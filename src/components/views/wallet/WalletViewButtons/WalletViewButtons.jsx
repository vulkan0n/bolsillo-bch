import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { SendOutlined, HistoryOutlined } from "@ant-design/icons";
import { selectScannerIsScanning } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import Button from "@/atoms/Button";
import ScannerButton from "../ScannerButton/ScannerButton";
import TorchButton from "../TorchButton/TorchButton";
import ImageSelectButton from "../ImageSelectButton/ImageSelectButton";

import { useClipboard } from "@/hooks/useClipboard";
import { navigateOnValidUri } from "@/util/uri";

export default function WalletViewButtons() {
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const { getClipboardContents } = useClipboard();

  const forwardOnValidAddress = async (input) => {
    const navTo = await navigateOnValidUri(input);
    if (navTo) {
      navigate(navTo);
    }
  };

  const pasteAddressFromClipboard = async () => {
    let navTo = "";
    try {
      const { value, spawnPasteToast } = await getClipboardContents();
      navTo = await navigateOnValidUri(value);
      if (navTo !== "") {
        spawnPasteToast();
        navigate(navTo);
      }
    } catch (e) {
      //console.warn(e);
    } finally {
      if (navTo === "") {
        navigate("/wallet/send/");
      }
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
          outerLabelColor="white opacity-80"
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
        <TorchButton iconSize="2xl" outerLabelColor="white opacity-80" />
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
