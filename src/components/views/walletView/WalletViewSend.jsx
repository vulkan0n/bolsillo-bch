import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  decodeCashAddress,
  decodeCashAddressFormatWithoutPrefix,
} from "@bitauth/libauth";

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
    <div>
      <div className="form-control">
        <input
          type="text"
          placeholder="Enter BCH Address"
          value={sendAddress}
          onChange={handleSendAddressChange}
          className="input input-md input-ghost w-full"
        />
      </div>
      <div className="" style={{ maxHeight: "50vh" }}>
        <ul>
          <li>Contact One</li>
          <li>Contact Two</li>
          <li>Contact Three</li>
          <li>Contact Four</li>
          <li>Contact Five</li>
          <li>Contact Five</li>
          <li>Contact Five</li>
        </ul>
      </div>
      <div className="bg-zinc-800 overflow-y-auto" style={{ maxHeight: "45.2vh" }}>
        <TransactionHistory />
      </div>
    </div>
  );
}

export default WalletViewSend;
