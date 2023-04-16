import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";

import { validateInvoiceString } from "@/util/invoice";

import { ReconciliationOutlined } from "@ant-design/icons";

import ContactPicker from "./ContactPicker";
import TransactionHistory from "./TransactionHistory";

function WalletViewSend() {
  const navigate = useNavigate();

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
  return (
    <div>
      <div className="flex items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Enter BCH Address"
            value={sendAddress}
            onChange={handleSendAddressChange}
            className="my-2 p-2 w-full outline-none rounded-l-lg bg-zinc-100 focus:text-secondary focus:bg-zinc-200"
          />
        </div>
        <div
          className="rounded-r-md bg-zinc-100 p-2 cursor-pointer"
          onClick={pasteAddressFromClipboard}
        >
          <ReconciliationOutlined className="text-2xl text-zinc-600 opacity-80" />
        </div>
      </div>
      <ContactPicker />
      <div className="flex-1 p-2 overflow-y-auto">
        <TransactionHistory />
      </div>
    </div>
  );
}

export default WalletViewSend;
