import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { useSelector, useDispatch } from "react-redux";
import { selectScannerIsScanning, setScannerIsScanning } from "@/redux/device";
import { SendOutlined, PictureOutlined } from "@ant-design/icons";
import { validateInvoiceString } from "@/util/invoice";
import Button from "@/components/atoms/Button";
import ScannerButton from "./ScannerButton";

export default function SendWidget() {
  const dispatch = useDispatch();
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

  const selectFromCameraRoll = () => null;

  return (
    <div className="flex items-center w-auto mx-4 justify-evenly">
      {isScanning ? null : (
        <Button
          icon={PictureOutlined}
          label="Image"
          onClick={selectFromCameraRoll}
          iconSize="2xl"
        />
      )}
      <ScannerButton />
      {isScanning ? null : (
        <Button
          icon={SendOutlined}
          label="Send"
          onClick={pasteAddressFromClipboard}
          iconSize="2xl"
        />
      )}
    </div>
  );
}
