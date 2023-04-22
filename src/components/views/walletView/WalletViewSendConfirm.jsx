import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { bchToSats, satsToBch, MAX_SATOSHI } from "@/util/sats";
import { Decimal } from "decimal.js";
import { useLongPress } from "use-long-press";
import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences } from "@/redux/preferences";
import FiatOracleService from "@/services/FiatOracleService";
import TransactionManagerService from "@/services/TransactionManagerService";

function WalletViewSendConfirm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();
  const { balance } = useSelector(selectActiveWallet);

  const [amount, setAmount] = useState(searchParams.get("amount") || "0");
  const [message, setMessage] = useState("");
  const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);

  const preferences = useSelector(selectPreferences);
  const navigate = useNavigate();

  const denominateSats = preferences["denominateSats"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const FiatOracle = new FiatOracleService();

  const satoshis = preferLocal
    ? FiatOracle.toSats(amount)
    : denominateSats
    ? new Decimal(amount)
    : FiatOracle.toBch(amount);

  const fiatAmount = FiatOracle.toFiat(satoshis);

  console.log("satoshis", satoshis, "fiatAmount", fiatAmount);

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
    // fail if insufficient funds
    if (isInsufficientFunds) {
      setMessage("Insufficient Funds");
      return;
    }

    /*const TransactionManager = new TransactionManagerService();

    // construct transaction
    const { tx_hash, tx_hex } = TransactionManager.buildTransaction([
      { address, amount: satoshis },
    ]);

    const result = Electrum.broadcastTransaction(tx_hex);
    const success = result === tx_hash;*/
    const success = false;

    if (success) {
      navigate("/wallet/send/success");
    } else {
      setMessage("Transaction failed! Try again");
    }
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
        const bchKeyLogic = (amount) => {
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

        const satsKeyLogic = (amount) => {
          if (new Decimal(`${amount}${key}`).greaterThan(MAX_SATOSHI)) {
            return `${amount}`;
          }

          return `${amount}${key}`;
        };

        const fiatKeyLogic = (amount) => {
          const split = amount.split(".");
          const major = split[0];
          const minor = split.length > 1 ? split[1] : "";

          if (minor.length >= 2) {
            return `${major}.${minor.substring(0, 2)}`;
          }

          return `${amount}${key}`;
        };

        const newAmount =
          amount === "0"
            ? `${key}`
            : preferLocal
            ? fiatKeyLogic(amount)
            : denominateSats
            ? satsKeyLogic(amount)
            : bchKeyLogic(amount);
        setAmount(newAmount);
        break;
    }
  }

  const bindLongPress = useLongPress(
    () => {
      setAmount("0");
    },
    { threshold: 650 }
  );

  // TODO: tap formatted address to toggle long/shortform (preference)
  const formattedAddress = address.includes(":")
    ? address.split(":")[1]
    : address;

  return (
    <div className="p-2">
      <div className="text-center">
        <div className="rounded p-1 bg-zinc-50">
          {message === "" ? (
            <>
              <div className="text-xs">Sending to</div>
              <div className="text-xs font-semibold font-mono opacity-90 text-secondary">
                {formattedAddress}
              </div>
            </>
          ) : (
            <div className="text-error tracking-wide">{message}</div>
          )}
        </div>
      </div>
      {preferLocal ? (
        <div className="text-center my-2">
          <div className="text-center text-3xl text-neutral-700 tabular-nums">
            ${amount}&nbsp;
            <span className="text-2xl">{preferences["localCurrency"]}</span>
          </div>
          <div className="text-center text-neutral-400">
            ₿&nbsp;{denominateSats ? `${FiatOracle.toSats(amount)} sats` : `${FiatOracle.toBch(amount)} BCH`}
          </div>
        </div>
      ) : (
        <div className="text-center my-2">
          <div className="text-center text-3xl text-neutral-700 tabular-nums">
            <span className="text-2xl">₿</span>&nbsp;
            {denominateSats ? `${amount}` : `${amount}`}&nbsp;
            <span className="text-2xl">{denominateSats ? "sats" : "BCH"}</span>
          </div>
          <div className="text-center text-neutral-400">
            ${fiatAmount}&nbsp;{preferences["localCurrency"]}
          </div>
        </div>
      )}

      <div
        className="grid grid-rows-4 text-center w-full border border-4 rounded-lg border-gray-300 items-center"
        style={{ height: "16rem" }}
      >
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(7)}
            >
              7
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(8)}
            >
              8
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(9)}
            >
              9
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(4)}
            >
              4
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(5)}
            >
              5
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(6)}
            >
              6
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(1)}
            >
              1
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(2)}
            >
              2
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(3)}
            >
              3
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 h-full bg-gray-200 text-zinc-700">
          <div>
            {denominateSats ? (
              <span>&nbsp;</span>
            ) : (
              <button
                className="w-full h-full text-xl"
                onClick={() => handleKeypadPress(".")}
              >
                .
              </button>
            )}
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress(0)}
            >
              0
            </button>
          </div>
          <div>
            <button
              className="w-full h-full text-xl"
              onClick={() => handleKeypadPress("X")}
              {...bindLongPress()}
            >
              &lt;
            </button>
          </div>
        </div>
      </div>

      <div className="flex mt-3 gap-x-1">
        <div className="basis-1/4">
          <button
            onClick={() => navigate(-1)}
            className="btn text-center border-2 border-zinc-200 w-full"
          >
            Back
          </button>
        </div>
        <div className="flex-1">
          <button
            onClick={confirmSend}
            className="btn bg-primary text-white w-full h-full"
          >
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
