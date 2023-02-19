import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validateInvoiceString from "@/util/invoice";

import ContactPicker from "./ContactPicker";
import TransactionHistory from "./TransactionHistory";

function WalletViewSend() {
  const navigate = useNavigate();

  const [sendAddress, setSendAddress] = useState("");

  const handleSendAddressChange = (e) => {
    const input = e.target.value;
    setSendAddress(input);

    // go to send screen when valid address is entered
    const { valid, address, query } = validateInvoiceString(input);

    // decoder function returns object on success, string on error
    if (valid) {
      navigate(`/wallet/send/${address}${query}`);
    }
  };

  // TODO: Scan QR Code from saved image
  return (
    <div className="flex flex-col justify-between">
      <div className="form-control flex-0">
        <input
          type="text"
          placeholder="Enter BCH Address"
          value={sendAddress}
          onChange={handleSendAddressChange}
          className="m-2 p-2 outline-none rounded-lg bg-zinc-100 focus:outline-zinc-300"
        />
      </div>
      <ContactPicker />
      <div className="flex-1 p-2 overflow-y-auto">
        <TransactionHistory />
      </div>
    </div>
  );
}

export default WalletViewSend;
