import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function WalletViewSendConfirm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();

  const amount = searchParams.get("amount");

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
