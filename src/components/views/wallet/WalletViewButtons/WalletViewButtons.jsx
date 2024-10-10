import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import { Haptics, NotificationType } from "@capacitor/haptics";
import { Clipboard } from "@capacitor/clipboard";
import {
  SendOutlined,
  HistoryOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { selectScannerIsScanning } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import Button from "@/atoms/Button";
import ScannerButton from "../ScannerButton/ScannerButton";
import TorchButton from "../TorchButton/TorchButton";
import ImageSelectButton from "../ImageSelectButton/ImageSelectButton";

import { validateBchUri } from "@/util/uri";
import ToastService from "@/services/ToastService";

const { noBchAddress, pleaseCopy, history, send } = translations;

export default function WalletViewButtons() {
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const forwardOnValidAddress = (input) => {
    // go to send screen when valid address is entered
    const {
      isValid,
      isPaymentProtocol,
      isWif,
      address,
      query,
      requestUri,
      wif,
    } = validateBchUri(input);

    if (isValid) {
      //Haptics.notification({ type: NotificationType.Success });

      let navTo;
      if (isPaymentProtocol) {
        navTo = `/wallet/pay/?r=${requestUri}`;
      } else if (isWif) {
        navTo = `/wallet/sweep/${wif}`;
      } else {
        navTo = `/wallet/send/${address}${query}`;
      }

      navigate(navTo);
    } else {
      //Haptics.notification({ type: NotificationType.Error });
    }

    return isValid;
  };

  const pasteAddressFromClipboard = async () => {
    let isValid = false;
    try {
      // NOTE: Firefox does not support the Clipboard.read browser API yet!
      // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#clipboard_availability
      // Error: Reading from clipboard not supported in this browser
      // Firefox users must set "dom.events.asyncClipboard.read" to "true" in about:config
      const paste = (await Clipboard.read()).value;
      isValid = await forwardOnValidAddress(paste);
    } catch (e) {
      console.warn(e);
    } finally {
      const titleTranslation = translate(noBchAddress);
      const descriptionTranslation = translate(pleaseCopy);

      if (!isValid) {
        ToastService().spawn({
          icon: <ExclamationCircleFilled className="text-primary text-4xl" />,
          header: titleTranslation,
          body: descriptionTranslation,
          options: {
            duration: 2000,
          },
        });
      }
    }
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <>
      <div className="mb-2">{!isScanning && <hr />}</div>
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
          <TorchButton iconSize="2xl" labelColor="white opacity-80" />
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
