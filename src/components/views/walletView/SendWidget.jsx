import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { Camera } from "@capacitor/camera";
import { useSelector, useDispatch } from "react-redux";
import { selectScannerIsScanning, setScannerIsScanning } from "@/redux/device";
import {
  ReconciliationOutlined,
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { validateInvoiceString } from "@/util/invoice";
import QrScanner from "qr-scanner";
import Button from "@/components/atoms/Button";
import HrLabel from "@/components/atoms/HrLabel";
import ScannerButton from "./ScannerButton";

export default function SendWidget() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sendAddress, setSendAddress] = useState("");
  const isScanning = useSelector(selectScannerIsScanning);

  const handleSendAddressChange = (e) => {
    const input = e.target.value;
    setSendAddress(input);
    forwardOnValidAddress(input);
  };

  const pasteAddressFromClipboard = async () => {
    const paste = (await Clipboard.read()).value;
    const valid = forwardOnValidAddress(paste);

    if (!valid) {
      // TODO: toast that we can't paste here
      setSendAddress(paste);
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

  const handleImageSelectButton = async () => {
    const { dataUrl } = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: "dataUrl",
      source: "PHOTOS",
    });

    try {
      const result = await QrScanner.scanImage(dataUrl);
      forwardOnValidAddress(result);
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="mb-4">
        {!isScanning && <HrLabel text="Send" icon={SendOutlined} />}
      </div>
      <div className="flex items-center w-auto mx-4 justify-evenly">
        {!isScanning && (
          <Button
            icon={PictureOutlined}
            label="Image"
            onClick={handleImageSelectButton}
            iconSize="2xl"
          />
        )}
        <ScannerButton />
        {!isScanning && (
          <Button
            icon={ReconciliationOutlined}
            label="Paste"
            onClick={pasteAddressFromClipboard}
            iconSize="2xl"
          />
        )}
      </div>
    </>
  );
}
