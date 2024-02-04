import Logger from "js-logger";
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
} from "@/redux/preferences";

import { selectKeyboardIsOpen } from "@/redux/device";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import { bchToSats, DUST_LIMIT } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";
import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewSend() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const inputRef = useRef();

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const wallet = useSelector(selectActiveWallet);

  const { address } = validateInvoiceString(params.address);

  const [message, setMessage] = useState("");

  const { shouldPreferLocalCurrency, localCurrency } = useSelector(
    selectCurrencySettings
  );

  const currency = shouldPreferLocalCurrency ? localCurrency : "BCH";

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : new Decimal(0);

  const [satoshiInput, setSatoshiInput] = useState(querySats);
  // used to force re-render of SatoshiInput component with MAX button
  const [satoshiInputKey, setSatoshiInputKey] = useState("satoshiInputKey");

  const isInsufficientFunds = new Decimal(wallet.balance).lessThan(
    satoshiInput
  );

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const handleAmountInput = (satInput) => {
    setSatoshiInput(satInput);
    setSatoshiInputKey("satoshiInputKey");
    setMessage("");
  };

  const confirmSend = async () => {
    if (isInsufficientFunds) {
      await Haptics.notification({ type: NotificationType.Warning });
      const insufficientFundsTranslation = translate(
        translations.insufficientFunds
      );
      setMessage(insufficientFundsTranslation);
      return;
    }

    const TransactionManager = TransactionManagerService();
    const TransactionBuilder = TransactionBuilderService(wallet);

    const transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount: satoshiInput },
    ]);

    if (typeof transaction !== "object") {
      Logger.warn(transaction);
      await Haptics.notification({ type: NotificationType.Warning });
      //setMessage(translate(translations.notEnoughFee));
      setMessage("Transaction Failed: Wallet out of sync?");
      return;
    }

    const isSuccess = await TransactionManager.sendTransaction(
      transaction,
      wallet
    );

    if (isSuccess) {
      const tx = await TransactionManager.resolveTransaction(transaction.txid);
      await Haptics.notification({ type: NotificationType.Success });
      navigate("/wallet/send/success", {
        state: { tx },
      });
    } else {
      await Haptics.notification({ type: NotificationType.Error });
      //setMessage(translate(translations.transactionFailed));
      setMessage(`Transaction Failed: Must send at least ${DUST_LIMIT} sats`);
    }
  };

  useEffect(function handleInstantPay() {
    if (!isInstantPayEnabled) {
      return;
    }

    const requestAmount = bchToSats(searchParams.get("amount") || 0);

    if (
      requestAmount.greaterThan(0) &&
      requestAmount.lessThanOrEqualTo(instantPayThreshold)
    ) {
      //Logger.debug("instapay!", threshold, requestAmount);
      confirmSend();
    }
  });

  const handleSendMax = () => {
    let amount = new Decimal(wallet.balance);

    const TransactionBuilder = TransactionBuilderService(wallet);

    let transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount },
    ]);

    while (typeof transaction !== "object") {
      amount = new Decimal(transaction);
      transaction = TransactionBuilder.buildP2pkhTransaction([
        { address, amount },
      ]);
    }

    const clampedAmount = new Decimal(Math.max(0, amount.toNumber()));
    setSatoshiInput(clampedAmount);
    // force re-render of SatoshiInput component
    setSatoshiInputKey(clampedAmount.toString());
  };

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );

    inputRef.current.focus();
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
              key={satoshiInputKey}
              onChange={handleAmountInput}
              satoshis={satoshiInput}
              size={1}
              className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner ${
                isInsufficientFunds ? "text-error" : "text-black/70"
              }`}
              autoFocus
              ref={inputRef}
            />
            <Button
              className="text-xs spacing-wide font-semibold text-zinc-800 rounded-full border border-zinc-200 bg-zinc-100"
              icon={MaxButton}
              iconSize="xs font-bold"
              onClick={handleSendMax}
            />
          </div>
        </div>

        <div
          className="p-2 relative text-center w-full"
          onClick={handleFlipCurrency}
        >
          <span className="text-2xl font-semibold text-center w-full text-zinc-800/80">
            <Satoshi value={satoshiInput} fiat={!shouldPreferLocalCurrency} />
            <CurrencyFlip className="text-3xl ml-2" />
          </span>
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
