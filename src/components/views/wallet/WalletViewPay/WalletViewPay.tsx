import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Decimal from "decimal.js";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectKeyboardIsOpen } from "@/redux/device";
import { selectActiveWallet } from "@/redux/wallet";
import { selectSyncState } from "@/redux/sync";
import { selectInstantPaySettings } from "@/redux/preferences";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";
import SecurityService from "@/services/SecurityService";
import LogService from "@/services/LogService";

import Button from "@/atoms/Button";
import CountdownTimer from "@/components/atoms/CountdownTimer";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import Satoshi from "@/atoms/Satoshi";

import {
  type PaymentRequestResponse,
  JppV2Client,
} from "@/util/payment_protocol";
import { translate } from "@/util/translations";
import translations from "@/components/views/wallet/WalletViewPay/translations";

const Log = LogService("WalletViewPay");
const jppClient = new JppV2Client();

export default function WalletViewPay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sync = useSelector(selectSyncState);
  const wallet = useSelector(selectActiveWallet);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const [message, setMessage] = useState("");
  const [detailedMessage, setDetailedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentRequestResponse | null>(
    null
  );

  // Calculate the total satoshi amount required.
  const totalSats = useMemo(() => {
    if (!paymentData) {
      return 0;
    }

    return paymentData.instructions[0].outputs.reduce((total, output) => {
      return total + output.amount;
    }, 0);
  }, [paymentData]);

  // Get the request URL from our query parameters.
  const requestUri = searchParams.get("r");
  if (!requestUri) {
    throw new Error("Invalid or missing request URI");
  }

  const isInsufficientFunds = new Decimal(wallet.balance).lessThan(0);

  const handleExpire = () => {
    setMessage(translate(translations.invalidInvoice));
    setDetailedMessage(translate(translations.invoiceExpired));
  };

  const confirmSend = useCallback(
    async (isInstantPay: boolean = false) => {
      // We want to support two different error messages
      // 1. One succinct one for the top bar (always "Transaction Failed").
      // 2. One more detailed one which *may* not have translations (this comes from the thrown error).
      try {
        if (isSending || !paymentData) {
          return;
        }

        setIsSending(true);

        const isAuthorized =
          isInstantPay || (await SecurityService().authorize());
        if (!isAuthorized) {
          return;
        }

        if (isInsufficientFunds) {
          throw new Error(translate(translations.insufficientFunds));
        }

        if (!sync.isConnected) {
          ToastService().disconnected();
          throw new Error(translate(translations.walletDisconnected));
        }

        // Format the outputs into correct format for the Transaction Builder.
        // NOTE: This is more to satisfy Typescript as Tx Builder expects Decimal type.
        const outputsFormatted = paymentData.instructions[0].outputs.map(
          (out) => {
            return {
              address: out.address,
              amount: new Decimal(out.amount),
            };
          }
        );

        // Build the transaction.
        const TransactionBuilder = TransactionBuilderService(wallet);
        const transaction =
          TransactionBuilder.buildP2pkhTransaction(outputsFormatted);

        // Handle wallet out of sync error.
        if (transaction === null) {
          throw new Error("Transaction Failed: Wallet out of sync?");
        }

        // Handle insufficient funds error.
        if (typeof transaction === "number") {
          throw new Error(translate(translations.insufficientFunds));
        }

        // Respond to the payment URL with the signed transaction.
        const paymentResponse = await jppClient.payment(
          paymentData.paymentUrl,
          {
            chain: "BCH",
            transactions: [{ tx: transaction.hex }],
          }
        );

        // Wait until we actually see the transaction on our node.
        const TransactionManager = TransactionManagerService();
        const tx = await TransactionManager.waitForTransactionToResolve(
          transaction.txid
        );

        // Show a success notification and route the user to the success page.
        await Haptics.notification({ type: NotificationType.Success });
        navigate("/wallet/send/success", {
          state: { tx, prefillMemo: paymentResponse.memo || "" },
          replace: true,
        });
      } catch (error) {
        await Haptics.notification({ type: NotificationType.Error });
        Log.debug(error);
        setMessage(translate(translations.transactionFailed));
        setDetailedMessage(`${error}`);
      } finally {
        setIsSending(false);
      }
    },
    [
      isInsufficientFunds,
      isSending,
      navigate,
      paymentData,
      sync.isConnected,
      wallet,
    ]
  );

  // Fetch the payment request.
  useEffect(
    function handlePaymentRequest() {
      const fetchPaymentRequest = async () => {
        try {
          setIsLoading(true);
          setPaymentData(await jppClient.paymentRequest(requestUri));
        } catch (error) {
          setMessage("Invalid invoice");
          setDetailedMessage(`${error}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPaymentRequest();
    },
    [requestUri]
  );

  // Handle instant pay.
  // NOTE: Some of the logic below is to prevent a race-condition whereby a user can land on this page prior to Electrum being connected.
  //       The intent is to allow Selene to be invoked by a "bitcoincash:?r=${url}" URL and "wait" for connection before triggering instant pay.
  useEffect(
    function handleInstantPay() {
      // If instant pay is not enabled, return to prevent further execution.
      if (!isInstantPayEnabled) {
        return;
      }

      // If we are not yet synced, return to prevent further execution.
      if (!sync.isConnected) {
        return;
      }

      // If the payment data is not yet available, return to prevent further execution.
      if (!paymentData) {
        return;
      }

      // If we are within the instant pay threshold, send the tx.
      if (totalSats > 0 && totalSats <= instantPayThreshold) {
        confirmSend(true);
      }
    },
    [
      isInstantPayEnabled,
      paymentData,
      sync.isConnected,
      totalSats,
      instantPayThreshold,
      confirmSend,
    ]
  );

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary p-2">
            <div className="text-xl font-bold">
              {translate(translations.paymentTo)}
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              <div>{new URL(requestUri).hostname}</div>
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-2xl font-bold">{message}</div>
          </div>
        )}
      </div>

      {isLoading || isSending ? (
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <>
          <div className="p-2 fixed top-[40%] w-full">
            {!message ? (
              <>
                <div className="py-4 px-2">
                  <div className="flex items-center justify-center">
                    {paymentData.memo}
                  </div>
                </div>
                <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
                  <div className="flex items-center justify-center">
                    <Satoshi value={totalSats} flip />
                    <CurrencyFlip className="text-3xl ml-2" />
                  </div>
                </div>
                <div className="py-4 px-2 rounded-md">
                  <div className="flex justify-center">
                    Expires in&nbsp;
                    <CountdownTimer
                      expiryDate={paymentData.expires}
                      onExpire={handleExpire}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 px-2">
                <div className="flex items-center justify-center">
                  {detailedMessage || message}
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex absolute ${buttonsPos} w-full justify-around items-center px-2 gap-x-2`}
          >
            {paymentData && !message ? (
              <>
                <div className="mx-2">
                  <Button onClick={() => navigate(-1)} icon={BackIcon} />
                </div>
                <div className="flex-1">
                  <Button
                    size="full"
                    icon={ConfirmIcon}
                    shittyFullWidthHack
                    onClick={() => confirmSend()}
                    inverted
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <Button
                  size="full"
                  onClick={() => navigate(-1)}
                  icon={BackIcon}
                  shittyFullWidthHack
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
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
