import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";

import { useSelector, useDispatch } from "react-redux";
import { selectIsScanning, setIsScanning } from "@/redux/scanner";

import { ReconciliationOutlined, QrcodeOutlined } from "@ant-design/icons";

import { validateInvoiceString } from "@/util/invoice";

import ScannerButton from "./ScannerButton";
import TransactionHistory from "./TransactionHistory";

export default function WalletViewSend() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isScanning = useSelector(selectIsScanning);

  const [sendAddress, setSendAddress] = useState("");

  useEffect(
    function forwardOnValidAddress() {
      // go to send screen when valid address is entered
      const { valid, address, query } = validateInvoiceString(sendAddress);

      // decoder function returns object on success, string on error
      if (valid) {
        navigate(`/wallet/send/${address}${query}`);
      }
    },
    [sendAddress]
  );

  const handleSendAddressChange = (e) => {
    const input = e.target.value;
    setSendAddress(input);
  };

  const pasteAddressFromClipboard = async () => {
    const paste = (await Clipboard.read()).value;
    console.log("attempting paste:", paste);

    // only paste a valid address/invoice
    const { valid, address, query } = validateInvoiceString(paste);
    console.log("paste validate got", address, query, valid);

    if (valid) {
      setSendAddress(paste);
      // TODO: toast that we pasted
    } else {
      // TODO: toast that we can't paste here
    }
  };

  // TODO: Scan QR Code from saved image
  return isScanning ? (
    <ScannerButton />
  ) : (
    <div>
      <div className="flex items-center bg-primary">
        <button
          type="button"
          className="text-white p-2"
          onClick={() => dispatch(setIsScanning(true))}
        >
          <QrcodeOutlined className="text-3xl" />
        </button>
        <div className="flex-1 mr-1 py-1">
          <div className="flex">
            <input
              type="text"
              placeholder="Enter BCH Address"
              value={sendAddress}
              onChange={handleSendAddressChange}
              className="p-2 flex-1 rounded-l-lg outline-none bg-white text-error focus:text-secondary focus:bg-zinc-50"
            />
            <div
              className="rounded-r-md bg-zinc-100 p-2 cursor-pointer"
              onClick={pasteAddressFromClipboard}
            >
              <ReconciliationOutlined className="text-2xl text-zinc-600 opacity-80" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-2">
        <TransactionHistory />
      </div>
    </div>
  );
}
