import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useOutletContext,
  useNavigate,
} from "react-router-dom";
import { bchToSats, satsToBch } from "@/util/sats";
import usePreferences from "@/hooks/usePreferences";

function WalletViewSendConfirm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();
  const { balance } = useOutletContext();

  const [amount, setAmount] = useState(searchParams.get("amount") || "0");
  const [message, setMessage] = useState("");

  const [preferences] = usePreferences();
  const navigate = useNavigate();

  const [shouldInstantPay, setShouldInstantPay] = useState(false);

  useEffect(
    function handleInstantPay() {
      if (shouldInstantPay) {
        console.log("instapay!", amount);
        confirmSend();
      }
    },
    [shouldInstantPay]
  );

  useEffect(
    function checkShouldInstantPay() {
      console.log(preferences);
      if (preferences["allowInstantPay"] !== "true") {
        setShouldInstantPay(false);
        return;
      }

      const threshold = Number.parseInt(preferences["instantPayThreshold"]);
      const satoshis = Number.parseInt(
        bchToSats(searchParams.get("amount") || 0)
      );

      if (satoshis > 0 && satoshis <= threshold) {
        console.log("shouldInstantPay", satoshis, threshold);
        setShouldInstantPay(true);
      }
    },
    [preferences]
  );

  function confirmSend() {
    const satoshis = Number.parseInt(bchToSats(amount));

    // fail if insufficient funds
    if (balance < satoshis) {
      setMessage("Insufficient Funds");
      return;
    }

    // sign and broadcast transaction
    const success = wallet.sendToAddress(address, satoshis);

    if (success) {
      navigate("/wallet/send/success");
    } else {
      setMessage("Transaction failed! Try again");
    }
  }

  function handleKeypadPress(key) {
    setMessage("");

    switch (key) {
      case "X":
        setAmount(
          amount.length > 1 ? amount.substr(0, amount.length - 1) : "0"
        );
        break;

      case ".":
        setAmount(amount.includes(".") ? amount : `${amount}.`);
        break;

      default:
        const keyLogic = (amount) => {
          if (amount === "0") {
            return `${key}`;
          }

          const split = amount.split(".");
          const major = split[0];
          const minor = split.length > 1 ? split[1] : "";

          if (minor.length === 8) {
            return `${amount}`;
          }

          if (minor === "") {
            if (Number.parseInt(`${amount}${key}`) > 21000000) {
              return `${amount}`;
            }
          }

          return `${amount}${key}`;
        };

        const newAmount = keyLogic(amount);
        setAmount(newAmount);
        break;
    }
  }

  const unit = "BCH";
  const formattedAddress = address.includes(":")
    ? address.split(":")[1]
    : address;

  return (
    <div className="p-4 pt-2 overflow-y-hidden">
      <div className="text-center h-10">
        {message !== "" ? (
          <div className="pt-1 text-lg font-semibold">{message}</div>
        ) : (
          <>
            <div className="text-sm">Sending to</div>
            <div className="text-sm font-semibold">{formattedAddress}</div>
          </>
        )}
      </div>
      <div className="text-center text-3xl pt-1 pb-2 font-medium text-gray-600">
        {amount} {unit}
      </div>

      <div className="grid grid-rows-4 h-72 text-center w-full border border-4 rounded-lg border-gray-300 items-center">
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(7)}
            >
              7
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(8)}
            >
              8
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(9)}
            >
              9
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(4)}
            >
              4
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(5)}
            >
              5
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(6)}
            >
              6
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(1)}
            >
              1
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(2)}
            >
              2
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(3)}
            >
              3
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(".")}
            >
              .
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress(0)}
            >
              0
            </button>
          </div>
          <div>
            <button
              className="btn btn-ghost w-full h-full text-xl"
              onClick={() => handleKeypadPress("X")}
            >
              &lt;
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button onClick={confirmSend} className="btn btn-primary mt-3 w-full">
          Confirm
        </button>
      </div>
    </div>
  );
}

export default WalletViewSendConfirm;
