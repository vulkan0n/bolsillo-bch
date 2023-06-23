import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectScannerIsScanning } from "@/redux/device";

import { Clipboard } from "@capacitor/clipboard";

import {
  SendOutlined,
  HistoryOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import Button from "@/components/atoms/Button";
import ScannerButton from "./ScannerButton";
import TorchButton from "./TorchButton";
import ImageSelectButton from "./ImageSelectButton";

import { validateInvoiceString } from "@/util/invoice";
import showToast from "@/util/toast";

export default function WalletViewButtons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const pasteAddressFromClipboard = async () => {
    let valid = false;
    try {
      const paste = (await Clipboard.read()).value;
      valid = forwardOnValidAddress(paste);
    } catch (e) {
      console.warn(e);
    } finally {
      if (!valid) {
        showToast({
          icon: <ExclamationCircleFilled className="text-primary text-4xl" />,
          title: "No BCH Address Found",
          description: "Please copy a BCH address to your clipboard.",
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

    // decoder function returns object on success, string on error
    if (isValid) {
      navigate(`/wallet/send/${address}${query}`);
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
            label="History"
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
            label="Send"
            onClick={pasteAddressFromClipboard}
            iconSize="2xl"
          />
        )}
      </div>
    </>
  );
}
