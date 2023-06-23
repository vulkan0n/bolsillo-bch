import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";

import { Decimal } from "decimal.js";
import { useLongPress } from "use-long-press";

import {
  bchToSats,
  satsToBch,
  MAX_SATOSHI,
  formatSatoshis,
  satsToDisplayAmount,
} from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";

import CurrencyService from "@/services/CurrencyService";
import TransactionManagerService from "@/services/TransactionManagerService";

import { ArrowLeftOutlined } from "@ant-design/icons";

import SatoshiInput from "@/components/atoms/SatoshiInput";
import Button from "@/components/atoms/Button";
import Address from "@/components/atoms/Address";
import CurrencySymbol from "@/components/atoms/CurrencySymbol";
import CurrencyFlip from "@/components/atoms/CurrencyFlip";

export default function WalletViewSend() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const wallet = useSelector(selectActiveWallet);

  const { isValid, address, isBase58Address } = validateInvoiceString(
    params.address
  );

  const [message, setMessage] = useState("");

  const preferences = useSelector(selectPreferences);
  const denominateSats = preferences["denominateSats"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const currency = preferLocal ? preferences["localCurrency"] : "BCH";
  const Currency = new CurrencyService(preferences["localCurrency"]);

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : "0";

  const [satoshiInput, setSatoshiInput] = useState({
    sats: querySats,
    display: satsToDisplayAmount(querySats),
  });

  const displayAmount = formatSatoshis(satoshiInput.sats, true);

  const isInsufficientFunds = wallet.balance < satoshiInput.sats;

  const handleAmountInput = (satInput) => {
    setSatoshiInput(satInput);
    setMessage("");
  };

  useEffect(function handleInstantPay() {
    if (preferences["allowInstantPay"] !== "true") {
      return;
    }

    const threshold = Number.parseInt(preferences["instantPayThreshold"]);
    const requestAmount = Number.parseInt(
      bchToSats(searchParams.get("amount") || 0)
    );

    if (requestAmount > 0 && requestAmount <= threshold) {
      console.log("instapay!", threshold, requestAmount);
      confirmSend();
    }
  }, []);

  async function confirmSend() {
    if (isInsufficientFunds) {
      setMessage("Insufficient Funds");
      return;
    }

    const TransactionManager = new TransactionManagerService();

    const transaction = TransactionManager.buildP2pkhTransaction(
      [{ address, amount: satoshiInput.sats }],
      wallet.id
    );

    if (typeof transaction !== "object") {
      setMessage("Transaction Failed: Not enough balance for miner fee");
      return;
    }

    const { tx_hash, tx_hex } = transaction;
    const success = await TransactionManager.sendTransaction(
      { tx_hash, tx_hex },
      wallet.id
    );

    if (success) {
      navigate("/wallet/send/success");
    } else {
      setMessage("Transaction failed.");
    }
  }

  const handleSendMax = () => {
    let amount = wallet.balance;

    const TransactionManager = new TransactionManagerService();

    let transaction = TransactionManager.buildP2pkhTransaction(
      [{ address, amount }],
      wallet.id
    );

    while (typeof transaction !== "object") {
      amount = transaction;
      transaction = TransactionManager.buildP2pkhTransaction(
        [{ address, amount }],
        wallet.id
      );
    }

    setSatoshiInput({ display: satsToDisplayAmount(amount), sats: amount });
  };

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary p-2">
            <div className="text-xl font-bold">Sending to</div>
            <div className="text-sm py-2 font-mono tracking-tight">
              <Address address={address} />
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-2xl font-bold">{message}</div>
          </div>
        )}
      </div>

      <div className="p-2 fixed top-[40%] w-full">
        <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
          <div className="flex items-center">
            <CurrencySymbol
              currency={currency}
              className="font-bold text-4xl mr-2"
            />
            <SatoshiInput
              onChange={handleAmountInput}
              satoshiInput={satoshiInput}
              size={1}
              className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner ${
                isInsufficientFunds ? "text-error" : "text-black/70"
              }`}
            />
            <Button
              className="text-xs spacing-wide font-semibold text-zinc-800 rounded-full border border-zinc-200 bg-zinc-100"
              icon={({ className }) => <span className={className}>MAX</span>}
              iconSize="xs font-bold"
              onClick={handleSendMax}
            />
          </div>
        </div>

        <div className="p-2 relative text-center w-full">
          <span className="text-2xl font-semibold text-center w-full text-zinc-800/80">
            {preferLocal ? displayAmount.bch : displayAmount.fiat}
          </span>
          <div className="absolute top-2 right-2 flex items-center">
            <Button icon={() => <CurrencyFlip className="text-xl" />} />
          </div>
        </div>
      </div>

      <div className="flex absolute bottom-[5em] w-full justify-around items-center px-2 gap-x-2">
        <div className="mx-2">
          <Button
            onClick={() => navigate(-1)}
            icon={() => (
              <span>
                <ArrowLeftOutlined className="mr-1" />
                Back
              </span>
            )}
          />
        </div>
        <div className="flex-1">
          <Button
            size="full"
            icon={() => <span className="font-bold">Confirm</span>}
            onClick={confirmSend}
            inverted
          />
        </div>
      </div>
    </>
  );
}
