import { useState } from "react";
import { Link } from "react-router-dom";
/* = MainView Send Tab =
 * send screen:
 *  1. enter address
 *  2. scan QR from image
 *  3. contact list/recent addresses/transaction log
 */

function WalletViewSend() {
  const [sendAddress, setSendAddress] = useState("");
  const handleSendAddressChange = (e) => setSendAddress(e.target.value);

  function confirmSend(address) {

  }

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter BCH Address"
          value={sendAddress}
          onChange={handleSendAddressChange}
        />
        <Link to={`/wallet/send/${sendAddress}`}>Send</Link>
      </div>
      <div>
        <ul>
          <li>Contact One</li>
          <li>Contact Two</li>
          <li>Contact Three</li>
          <li>Contact Four</li>
          <li>Contact Five</li>
        </ul>
      </div>
    </div>
  );
}

export default WalletViewSend;
