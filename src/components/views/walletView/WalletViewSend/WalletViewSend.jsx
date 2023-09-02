import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { Haptics } from "@capacitor/haptics";

import { useSelector } from "react-redux";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
} from "@/redux/preferences";

import { selectKeyboardIsOpen } from "@/redux/device";

import { bchToSats, formatSatoshis, satsToDisplayAmount } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";

import TransactionManagerService from "@/services/TransactionManagerService";

import SatoshiInput from "@/components/atoms/SatoshiInput";
import Button from "@/components/atoms/Button";
import Address from "@/components/atoms/Address";
import CurrencySymbol from "@/components/atoms/CurrencySymbol";
import CurrencyFlip from "@/components/atoms/CurrencyFlip";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewSend() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const wallet = useSelector(selectActiveWallet);

  const { address } = validateInvoiceString(params.address);

  const [message, setMessage] = useState("");

  const { localCurrency, shouldPreferLocalCurrency } = useSelector(
    selectCurrencySettings
  );

  const currency = shouldPreferLocalCurrency ? localCurrency : "BCH";

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : "0";

  const [satoshiInput, setSatoshiInput] = useState({
    sats: querySats,
    display: satsToDisplayAmount(querySats),
  });

  const displayAmount = formatSatoshis(satoshiInput.sats, true);

  const isInsufficientFunds = wallet.balance < satoshiInput.sats;

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const handleAmountInput = (satInput) => {
    setSatoshiInput(satInput);
    setMessage("");
  };

  const confirmSend = useCallback(async () => {
    if (isInsufficientFunds) {
      await Haptics.notification({ type: "WARNING" });
      const insufficientFundsTranslation = translate(
        translations.insufficientFunds
      );
      setMessage(insufficientFundsTranslation);
      return;
    }

    const TransactionManager = new TransactionManagerService();

    const transaction = TransactionManager.buildP2pkhTransaction(
      [{ address, amount: satoshiInput.sats }],
      wallet.id
    );

    if (typeof transaction !== "object") {
      await Haptics.notification({ type: "WARNING" });
      const notEnoughFeeTranslation = translate(translations.notEnoughFee);
      setMessage(notEnoughFeeTranslation);
      return;
    }

    const { tx_hash, tx_hex } = transaction;
    const success = await TransactionManager.sendTransaction(
      { tx_hash, tx_hex },
      wallet.id
    );

    if (success) {
      await Haptics.notification({ type: "SUCCESS" });
      navigate("/wallet/send/success");
    } else {
      await Haptics.notification({ type: "ERROR" });
      const transactionFailedTranslation = translate(
        translations.transactionFailed
      );
      setMessage(transactionFailedTranslation);
    }
  }, [address, isInsufficientFunds, navigate, satoshiInput.sats, wallet.id]);

  useEffect(
    function handleInstantPay() {
      if (!isInstantPayEnabled) {
        return;
      }

      const threshold = Number.parseInt(instantPayThreshold, 10);
      const requestAmount = Number.parseInt(
        bchToSats(searchParams.get("amount") || 0),
        10
      );

      if (requestAmount > 0 && requestAmount <= threshold) {
        //console.log("instapay!", threshold, requestAmount);
        confirmSend();
      }
    },
    [confirmSend, instantPayThreshold, isInstantPayEnabled, searchParams]
  );

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

    const clampedAmount = Math.max(0, amount);

    setSatoshiInput({
      display: satsToDisplayAmount(clampedAmount),
      sats: clampedAmount.toString(),
    });
  };

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary p-2">
            <div className="text-xl font-bold">
              {translate(translations.sendingTo)}
            </div>
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
              icon={MaxButton}
              iconSize="xs font-bold"
              onClick={handleSendMax}
            />
          </div>
        </div>

        <div className="p-2 relative text-center w-full">
          <span className="text-2xl font-semibold text-center w-full text-zinc-800/80">
            {shouldPreferLocalCurrency ? displayAmount.bch : displayAmount.fiat}
          </span>
          <div className="absolute top-2 right-2 flex items-center">
            <Button icon={CurrencyFlipIcon} />
          </div>
        </div>
      </div>

      <div
        className={`flex absolute ${buttonsPos} w-full justify-around items-center px-2 gap-x-2`}
      >
        <div className="mx-2">
          <Button onClick={() => navigate(-1)} icon={BackIcon} />
        </div>
        <div className="flex-1">
          <Button
            size="full"
            icon={ConfirmIcon}
            shittyFullWidthHack
            onClick={confirmSend}
            inverted
          />
        </div>
      </div>
    </>
  );
}

function MaxButton() {
  return <span>MAX</span>;
}

function ConfirmIcon() {
  return <span className="font-bold">{translate(translations.confirm)}</span>;
}

function BackIcon() {
  return (
    <span>
      <ArrowLeftOutlined className="mr-1" />
      {translate(translations.back)}
    </span>
  );
}

function CurrencyFlipIcon() {
  return <CurrencyFlip className="text-xl" />;
}
