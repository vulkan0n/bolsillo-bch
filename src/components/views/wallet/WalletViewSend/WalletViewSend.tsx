import Logger from "js-logger";
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
} from "@/redux/preferences";

import { selectKeyboardIsOpen } from "@/redux/device";
import { selectSyncState, selectMyAddresses } from "@/redux/sync";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";
import SecurityService from "@/services/SecurityService";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import { Haptic } from "@/util/haptic";
import { bchToSats, DUST_LIMIT } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";
import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewSend() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const wallet = useSelector(selectActiveWallet);
  const sync = useSelector(selectSyncState);

  const { address } = validateInvoiceString(params.address);

  const myAddresses = useSelector(selectMyAddresses);
  const isMyAddress = myAddresses[address] !== undefined;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleInsufficientFunds = async () => {
    await Haptic.warn();
    const insufficientFundsTranslation = translate(
      translations.insufficientFunds
    );
    setMessage(insufficientFundsTranslation);
  };

  const confirmSend = async (isInstantPay: boolean = false) => {
    if (isSending) {
      return;
    }

    setIsSending(true);
    const isAuthorized = isInstantPay || (await SecurityService().authorize());
    if (!isAuthorized) {
      setIsSending(false);
      return;
    }

    if (isInsufficientFunds) {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    if (!sync.isConnected) {
      ToastService().disconnected();
      setIsSending(false);
      return;
    }

    const TransactionManager = TransactionManagerService();
    const TransactionBuilder = TransactionBuilderService(wallet);

    const transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount: satoshiInput },
    ]);

    if (transaction === null) {
      Logger.warn(transaction);
      //setMessage(translate(translations.notEnoughFee));
      setMessage("Transaction Failed: Wallet out of sync?");
      setIsSending(false);
      await Haptic.warn();
      return;
    }

    if (typeof transaction === "number") {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    const isSuccess = await TransactionManager.sendTransaction(
      transaction,
      wallet
    );

    try {
      if (isSuccess) {
        const tx = await TransactionManager.resolveTransaction(
          transaction.txid
        );
        await Haptic.success();
        navigate("/wallet/send/success", {
          state: { tx },
          replace: true,
        });
      } else {
        //setMessage(translate(translations.transactionFailed));
        setMessage(`Transaction Failed: Must send at least ${DUST_LIMIT} sats`);
        await Haptic.error();
      }
    } finally {
      setIsSending(false);
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
      confirmSend(true);
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

    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary p-2">
            <div className="text-xl font-bold">
              {translate(translations.sendingTo)}
              {isMyAddress && <span> self</span>}
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              <Address address={address} />
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-2xl font-bold">{message}</div>
          </div>
        )}
      </div>

      {isSending ? (
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <>
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
                <Satoshi value={satoshiInput} flip />
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
                onClick={() => confirmSend(false)}
                inverted
              />
            </div>
          </div>
        </>
      )}
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
