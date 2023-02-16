import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

function WalletViewSendConfirm() {
  const { address } = useParams();
  const location = useLocation();

  const [amount, setAmount] = useState(location.query);

  function confirmSend() {
    // sign and broadcast transaction
  }

  return (
    <div>
      <div>Sending to {address}</div>
      <div>{amount}</div>

      <div>keypad</div>

      <div>
        <button onClick={confirmSend}>Confirm</button>
      </div>
    </div>
  );
}

export default WalletViewSendConfirm;
