import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Haptics } from "@capacitor/haptics";
import { selectScannerIsScanning } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import { Clipboard } from "@capacitor/clipboard";

import {
  SendOutlined,
  HistoryOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import Button from "@/components/atoms/Button";
import ScannerButton from "../ScannerButton/ScannerButton";
import TorchButton from "../TorchButton/TorchButton";
import ImageSelectButton from "../ImageSelectButton/ImageSelectButton";

import { validateInvoiceString } from "@/util/invoice";
import showToast from "@/util/toast";

const { noBchAddress, pleaseCopy, history, send } = translations;

export default function WalletViewButtons() {
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const pasteAddressFromClipboard = async () => {
    let valid = false;
    try {
      // NOTE: Firefox does not support the Clipboard.read browser API yet!
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#api.clipboard
      // Error: Reading from clipboard not supported in this browser
      // This paste button just won't work on Firefox
      // And Capacitor does not provide a way to check for individual browsers
      const paste = (await Clipboard.read()).value;
      valid = forwardOnValidAddress(paste);
    } catch (e) {
      console.warn(e);
    } finally {
      const titleTranslation = translate(noBchAddress);
      const descriptionTranslation = translate(pleaseCopy);

      if (!valid) {
        showToast({
          icon: <ExclamationCircleFilled className="text-primary text-4xl" />,
          title: titleTranslation,
          description: descriptionTranslation,
          options: {
            duration: 2000,
          },
        });
      }
    }
  };

  const forwardOnValidAddress = (input) => {
    // go to send screen when valid address is entered
    const { isValid, address, query } = validateInvoiceString(input);

    if (isValid) {
      Haptics.notification({ type: "SUCCESS" });
      navigate(`/wallet/send/${address}${query}`);
    } else {
      Haptics.notification({ type: "ERROR" });
    }

    return isValid;
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <>
      <div className="mb-3.5">{!isScanning && <hr />}</div>
      <div className="flex items-center w-auto mx-4 justify-evenly">
        {isScanning ? (
          <ImageSelectButton
            iconSize="2xl"
            labelColor="white opacity-80"
            onSelection={forwardOnValidAddress}
          />
        ) : (
          <Button
            icon={HistoryOutlined}
            label={translate(history)}
            onClick={handleHistoryButton}
            iconSize="2xl"
          />
        )}
        <ScannerButton />
        {isScanning ? (
          <TorchButton iconSize="md" labelColor="white opacity-80" />
        ) : (
          <Button
            icon={SendOutlined}
            label={translate(send)}
            onClick={pasteAddressFromClipboard}
            iconSize="2xl"
          />
        )}
      </div>
    </>
  );
}
