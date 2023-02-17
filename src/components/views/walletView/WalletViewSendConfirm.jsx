import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function WalletViewSendConfirm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();

  const [amount, setAmount] = useState(
    searchParams.get("amount") || "0.00000000"
  );

  function confirmSend() {
    // sign and broadcast transaction
  }

  const unit = "BCH";
  const formattedAddress = address.includes(":") ? address.split(":")[1] : address;

  return (
    <div className="p-4 pt-2 overflow-y-hidden">
      <div className="text-center">
        <div className="text-sm">Sending to</div>
        <div className="text-sm font-semibold">{formattedAddress}</div>
      </div>
      <div className="text-center text-3xl mt-0.5 pt-1 pb-1.5 font-medium text-gray-600">{amount} {unit}</div>

      <div class="grid grid-rows-4 h-72 text-center w-full border border-4 rounded-lg border-gray-300 items-center">
        <div class="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div><button className="btn btn-ghost w-full h-full text-xl">7</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">8</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">9</button></div>
        </div>
        <div class="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div><button className="btn btn-ghost w-full h-full text-xl">4</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">5</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">6</button></div>
        </div>
        <div class="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div><button className="btn btn-ghost w-full h-full text-xl">1</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">2</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">3</button></div>
        </div>
        <div class="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div><button className="btn btn-ghost w-full h-full text-xl">.</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">0</button></div>
          <div><button className="btn btn-ghost w-full h-full text-xl">&lt;</button></div>
        </div>
      </div>

      <div className="text-center">
        <button onClick={confirmSend} className="btn btn-primary mt-3 w-full">Confirm</button>
      </div>
    </div>
  );
}

export default WalletViewSendConfirm;
