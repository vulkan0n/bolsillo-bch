import Logger from "js-logger";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

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

import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";

import { bchToSats, DUST_LIMIT } from "@/util/sats";
import { translate } from "@/util/translations";
import translations from "@/components/views/wallet/WalletViewSend/translations";

export default function WalletViewPay() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requestUri } = useParams();

  const isExperimental = useSelector(selectIsExperimental);

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const wallet = useSelector(selectActiveWallet);
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

    const TransactionManager = TransactionManagerService();
    const TransactionBuilder = TransactionBuilderService(wallet);

    const transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount: requestAmount },
    ]);

    if (transaction === null) {
      Logger.warn(transaction);
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
      //Logger.debug("instapay!", threshold, requestAmount);
      confirmSend(true);
    }
  });

  return (
    <>
      {isSending ? (
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <>
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
