import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { bchToSats, satsToBch } from "@/util/sats";
import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";

function WalletViewSendConfirm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();
  const { balance } = useSelector(selectActiveWallet);

  const [amount, setAmount] = useState(searchParams.get("amount") || "0");
  const [message, setMessage] = useState("");

  const preferences = useSelector(selectPreferences);
  const navigate = useNavigate();

  useEffect(function handleInstantPay() {
    console.log(preferences);
    if (preferences["allowInstantPay"] !== "true") {
      return;
    }

    const threshold = Number.parseInt(preferences["instantPayThreshold"]);
    const invoiceAmount = Number.parseInt(
      bchToSats(searchParams.get("amount") || 0)
    );

    if (invoiceAmount > 0 && invoiceAmount <= threshold) {
      console.log("instapay!", threshold, amount, invoiceAmount);
      confirmSend();
    }
  }, []);

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

  function goBack() {
    navigate("/wallet/send");
  }

  function handleSlideToSend(event) {
    console.log("handleSlideToSend", event);
    if (event.target.value >= 100) {
      confirmSend();
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

  // TODO: allow entry in local currency
  const unit = "BCH";

  // TODO: tap formatted address to toggle long/shortform (preference)
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

      <div className="flex mt-3 gap-x-1">
        <div className="basis-1/4">
          <button
            onClick={goBack}
            className="btn text-center border-2 border-zinc-200 w-full"
          >
            Back
          </button>
        </div>
        <div className="flex-1">
        <button onClick={confirmSend} className="btn bg-secondary text-white w-full h-full">
          Confirm
        </button>
          {/*<SlideToSend onConfirm={confirmSend} />*/}
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendConfirm;

function SlideToSend({ onConfirm }) {
  const [percent, setPercent] = useState(0);

  function handleSlide(event) {
    setPercent(event.target.value);

    if (event.target.value >= 100) {
      onConfirm();
      setPercent(0);
    }
  }

  return (
    <input
      type="range"
      min="0"
      max="100"
      className="range range-lg justify-center h-full"
      step="1"
      value={percent}
      onChange={handleSlide}
      onPointerDown={() => setPercent(0)}
      onPointerUp={() =>
        setTimeout(() => {
          console.log("pointerup");
          setPercent(0);
        }, 25 + Number.parseInt(percent) * 1.5)
      }
    />
  );
}
