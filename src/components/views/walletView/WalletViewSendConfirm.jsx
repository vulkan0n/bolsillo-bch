import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";

import { Decimal } from "decimal.js";
import { useLongPress } from "use-long-press";

import { bchToSats, satsToBch, MAX_SATOSHI } from "@/util/sats";
import FiatOracleService from "@/services/FiatOracleService";
import TransactionManagerService from "@/services/TransactionManagerService";

import { TransactionOutlined } from "@ant-design/icons";

export default function WalletViewSendConfirm() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useParams();
  const wallet = useSelector(selectActiveWallet);

  const [amount, setAmount] = useState(searchParams.get("amount") || "0");
  const [message, setMessage] = useState("");

  const preferences = useSelector(selectPreferences);
  const navigate = useNavigate();

  const denominateSats = preferences["denominateSats"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const FiatOracle = new FiatOracleService();

  const satoshis = preferLocal
    ? FiatOracle.toSats(amount)
    : denominateSats
    ? new Decimal(amount)
    : bchToSats(amount);

  const fiatAmount = FiatOracle.toFiat(satoshis);

  const isInsufficientFunds = wallet.balance < satoshis;

  //console.log("satoshis", satoshis, "fiatAmount", fiatAmount);

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

  async function confirmSend() {
    // fail if insufficient funds
    if (isInsufficientFunds) {
      setMessage("Insufficient Funds");
      return;
    }

    const TransactionManager = new TransactionManagerService();

    // construct transaction
    const transaction = TransactionManager.buildP2pkhTransaction(
      [{ address, amount: satoshis }],
      wallet.id
    );

    if (transaction === null) {
      setMessage("Transaction Failed: Not enough balance for miner fee");
      return;
    }

    const { tx_hash, tx_hex } = transaction;
    const success = await TransactionManager.sendTransaction(
      { tx_hash, tx_hex },
      wallet.id
    );

    if (success) {
      console.log("transaction send success!");
      navigate("/wallet/send/success");
    } else {
      setMessage("Transaction failed.");
    }
  }

  const handleFlipLocalCurrency = () => {
    dispatch(
      setPreference({ key: "preferLocalCurrency", value: !preferLocal })
    );

    const newAmount = preferLocal
      ? denominateSats
        ? FiatOracle.toSats(amount)
        : FiatOracle.toBch(amount)
      : FiatOracle.toFiat(satoshis);

    if (new Decimal(newAmount).equals(0)) {
      setAmount("0");
    } else {
      setAmount(newAmount);
    }
  };

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

          return new Decimal(
            Array.from(`${amount}${key}`)
              .filter((char) => char !== ".")
              .join("")
          ).toString();
        };

        const fiatKeyLogic = (amount) => {
          const split = amount.split(".");
          const major = split[0];
          const minor = split.length > 1 ? split[1] : "";

          if (minor.length >= 2) {
            return `${major}.${minor.substring(0, 2)}`;
          }

          if (
            new Decimal(FiatOracle.toSats(`${amount}${key}`)).greaterThan(
              MAX_SATOSHI
            )
          ) {
            return `${amount}`;
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
              <div className="text-sm">Sending to</div>
              <div className="text-sm font-semibold font-mono opacity-90 text-secondary">
                {formattedAddress}
              </div>
            </>
          ) : (
            <div className="text-error tracking-wide">{message}</div>
          )}
        </div>
      </div>
      <div
        className={`text-center my-2 ${
          isInsufficientFunds ? "text-error" : "text-neutral-700"
        }`}
      >
        {preferLocal ? (
          <>
            <div className="text-center text-3xl tabular-nums">
              ${amount}&nbsp;
              <span className="text-2xl">{preferences["localCurrency"]}</span>
            </div>
            <div className="text-neutral-400">
              <span
                className="text-left cursor-pointer"
                onClick={handleFlipLocalCurrency}
              >
                ₿&nbsp;
                {denominateSats
                  ? `${FiatOracle.toSats(amount)} sats`
                  : `${FiatOracle.toBch(amount)} BCH`}
              </span>
              <TransactionOutlined
                className="cursor-pointer text-xl ml-2"
                onClick={handleFlipLocalCurrency}
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-center text-3xl tabular-nums">
              <span className="text-3xl font-mono">₿</span>&nbsp;
              {denominateSats ? `${amount}` : `${amount}`}&nbsp;
              <span className="text-2xl">
                {denominateSats ? "sats" : "BCH"}
              </span>
            </div>
            <div className="text-center text-neutral-400">
              <span
                onClick={handleFlipLocalCurrency}
                className="cursor-pointer"
              >
                ${fiatAmount}&nbsp;{preferences["localCurrency"]}
              </span>
              <TransactionOutlined
                className="cursor-pointer text-xl ml-2"
                onClick={handleFlipLocalCurrency}
              />
            </div>
          </>
        )}
      </div>

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
            {denominateSats && !preferLocal ? (
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
        </div>
      </div>
    </div>
  );
}
