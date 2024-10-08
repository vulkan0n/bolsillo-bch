import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useSWR from "swr";
import Decimal from "decimal.js";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";
import JsonPaymentProtocol from "json-payment-protocol";

import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
  selectIsExperimental,
} from "@/redux/preferences";

import { selectKeyboardIsOpen } from "@/redux/device";
import { selectSyncState } from "@/redux/sync";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";
import SecurityService from "@/services/SecurityService";
import LogService from "@/services/LogService";

import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";

import { bchToSats, DUST_LIMIT } from "@/util/sats";
import { translate } from "@/util/translations";
import translations from "@/components/views/wallet/WalletViewSend/translations";

const Log = LogService("WalletViewPay");

const trustedKeys = {
  mh65MN7drqmwpCRZcEeBEE9ceQCQ95HtZc: {
    // This is displayed to the user, somewhat like the organization field on an SSL certificate
    owner: "BitPay (TESTNET ONLY - DO NOT TRUST FOR ACTUAL BITCOIN)",
    // Which domains this key is valid for
    domains: ["test.bitpay.com"],
    // The actual public key which should be used to validate the signatures
    publicKey:
      "03159069584176096f1c89763488b94dbc8d5e1fa7bf91f50b42f4befe4e45295a",
  },
};

export default function WalletViewPay() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const requestUri = searchParams.get("r");

  const handlePaymentProtocol = async () => {
    const requestOptions = {};
    Log.debug("handlePaymentProtocol", requestUri);
    const client = new JsonPaymentProtocol(requestOptions, trustedKeys);

    Log.debug("client", client);
    const paymentOptions = await client.getPaymentOptions(requestUri);
    Log.debug("paymentOptions", paymentOptions);

    const { responseData: paymentRequest } = await client.selectPaymentOption(
      paymentOptions.requestUrl,
      "BCH",
      "BCH"
    );

    Log.debug("paymentRequest", paymentRequest);
    return paymentRequest;
    // create unsigned transaction
    // create signed transaction to get final size
  };

  const {
    data: paymentData,
    isLoading: isLoadingPaymentData,
    error: paymentDataError,
  } = useSWR(requestUri, handlePaymentProtocol);

  const wallet = useSelector(selectActiveWallet);

  if (paymentData) {
    const TransactionBuilder = TransactionBuilderService(wallet);

    const outputs = paymentData.instructions[0].outputs.map((out) => {
      return { ...out, address: `${wallet.prefix}:${out.address}` };
    });

    const transaction = TransactionBuilder.buildP2pkhTransaction(outputs);

    Log.debug("transaction", transaction);
  }

  const isExperimental = useSelector(selectIsExperimental);

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const sync = useSelector(selectSyncState);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const { shouldPreferLocalCurrency, localCurrency } = useSelector(
    selectCurrencySettings
  );

  const currency = shouldPreferLocalCurrency ? localCurrency : "BCH";

  const isInsufficientFunds = new Decimal(wallet.balance).lessThan(0);

  const handleInsufficientFunds = async () => {
    await Haptics.notification({ type: NotificationType.Warning });
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

    if (transaction === null) {
      Log.warn(transaction);
      await Haptics.notification({ type: NotificationType.Warning });
      //setMessage(translate(translations.notEnoughFee));
      setMessage("Transaction Failed: Wallet out of sync?");
      setIsSending(false);
      return;
    }

    if (typeof transaction === "number") {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    const { isSuccess, result } = await TransactionManager.sendTransaction(
      transaction,
      wallet
    );

    if (isSuccess) {
      const tx = await TransactionManager.resolveTransaction(transaction.txid);
      await Haptics.notification({ type: NotificationType.Success });
      navigate("/wallet/send/success", {
        state: { tx },
        replace: true,
      });
    } else {
      await Haptics.notification({ type: NotificationType.Error });
      //setMessage(translate(translations.transactionFailed));
      setMessage(
        isExperimental
          ? `${result}`
          : `Transaction Failed: Must send at least ${DUST_LIMIT} sats`
      );
    }

    setIsSending(false);
  };

  useEffect(function handleInstantPay() {
    if (!isInstantPayEnabled) {
      return;
    }

    if (
      requestAmount.greaterThan(0) &&
      requestAmount.lessThanOrEqualTo(instantPayThreshold)
    ) {
      //Log.debug("instapay!", threshold, requestAmount);
      confirmSend(true);
    }
  });

  return isSending || isLoadingPaymentData ? (
    <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
      <SyncOutlined className="text-7xl" spin />
    </div>
  ) : (
    <>
      <div>
        <Button
          onClick={() => handlePaymentProtocol()}
          label=""
          icon={RequestIcon}
        />
      </div>
      <div className="border rounded border-zinc-800">
        {paymentData && (
          <div>
            <h1>Payment Information</h1>
            <div>{paymentData.paymentId}</div>
            <div>{paymentData.time}</div>
            <div>{paymentData.expires}</div>
            <div>{paymentData.paymentUrl}</div>
            <div>{paymentData.memo}</div>
            <div>{JSON.stringify(paymentData.instructions)}</div>
          </div>
        )}
        {paymentDataError && (
          <div>
            <span className="text-error">
              Error: {JSON.stringify(paymentDataError)}
            </span>
          </div>
        )}
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
  );
}

function RequestIcon() {
  return <span className="font-bold">Request</span>;
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
