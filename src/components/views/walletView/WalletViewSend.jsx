import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  decodeCashAddress,
  decodeCashAddressFormatWithoutPrefix,
} from "@bitauth/libauth";

import ContactPicker from "./ContactPicker";
import TransactionHistory from "./TransactionHistory";

/* = MainView Send Tab =
 *  2. scan QR from image
 */

function WalletViewSend() {
  const navigate = useNavigate();

  const [sendAddress, setSendAddress] = useState("");

  const handleSendAddressChange = (e) => {
    const input = e.target.value;
    setSendAddress(input);

    // go to send screen when valid address is entered
    const decoded = input.includes(":")
      ? decodeCashAddress(input)
      : decodeCashAddressFormatWithoutPrefix(input);

    // decoder function returns object on success, string on error
    if (typeof decoded === "object") {
      navigate(`/wallet/send/${input}`);
    }
  };

  return (
    <>
      <div className="form-control">
        <input
          type="text"
          placeholder="Enter BCH Address"
          value={sendAddress}
          onChange={handleSendAddressChange}
          className="input input-md input-ghost w-full"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex-1">
          <ContactPicker />
        </div>
        <div className="bg-zinc-800 overflow-y-auto flex-1">
          <TransactionHistory />
        </div>
      </div>
    </>
  );
}

export default WalletViewSend;
