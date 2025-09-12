import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Dialog } from "@capacitor/dialog";
import {
  ArrowLeftOutlined,
  SyncOutlined,
  CloseOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

import * as clab from "@cashlab/common";
import {
  selectActiveWalletHash,
  selectActiveWalletBalance,
  selectWalletAddresses,
} from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
} from "@/redux/preferences";

import { selectIsConnected } from "@/redux/sync";
import { selectScannerIsScanning } from "@/redux/device";

import { useStablecoinBalance } from "@/hooks/useStablecoinBalance";

import AddressManagerService from "@/services/AddressManagerService";
import CurrencyService from "@/services/CurrencyService";
import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import TokenManagerService from "@/services/TokenManagerService";
import ToastService from "@/services/ToastService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import LogService from "@/services/LogService";
import StablecoinService, {
  TokenRecipient,
  StablecoinOffer,
} from "@/services/StablecoinService";

import FullColumn from "@/layout/FullColumn";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Editable from "@/atoms/Editable";
import Address from "@/atoms/Address";
import SlideToAction from "@/components/atoms/SlideToAction";
import ScannerButton from "@/views/wallet/ScannerButton/ScannerButton";
import ScannerOverlay from "@/views/wallet/ScannerOverlay";
import ConfirmConvertAndSendPayoutOverlay from "@/views/wallet/WalletViewSend/ConfirmConvertAndSendPayoutOverlay";

import { hexToBin } from "@/util/hex";
import { Haptic } from "@/util/haptic";
import { bchToSats } from "@/util/sats";
import { MUSD_TOKENID } from "@/util/tokens";
import { validateBchUri, navigateOnValidUri } from "@/util/uri";
import { translate } from "@/util/translations";
import translations from "./translations";

import CauldronDexService from "@/services/CauldronDexService";

const Log = LogService("WalletViewSendStablecoin");

export default function WalletViewSendStablecoin() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isScanning = useSelector(selectScannerIsScanning);

  const inputRef = useRef<HTMLInputElement>(null);

  const walletHash = useSelector(selectActiveWalletHash);
  const isConnected = useSelector(selectIsConnected);
  const { stablecoinBalance, volatileBalance } =
    useStablecoinBalance(walletHash);

  const TokenManager = TokenManagerService(walletHash);
  const tokenData = TokenManager.getToken(MUSD_TOKENID);

  const { address, isBase58Address, isValid } = validateBchUri(
    params.address || ""
  );

  const tokenRecipients = [];

  const myAddresses = useSelector(selectWalletAddresses);
  const isMyAddress =
    myAddresses.find((a) => a.address === address) !== undefined;

  const [isAddressInvalid, setIsAddressInvalid] = useState(
    address !== "" && !isValid
  );

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isInstantPayPending = useRef(false);
  const [isSendingProgressCancelable, setIsSendingProgressCancelable] =
    useState(false);
  const [
    isSendingProgressCancelAbortController,
    setIsSendingProgressCancelAbortController,
  ] = useState(false);

  const { shouldIncludeVolatileBalance } = useSelector(selectCurrencySettings);

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : BigInt(0);

  const [satoshiInput, setSatoshiInput] = useState(querySats);
  // used to force re-render of SatoshiInput component with MAX button
  const [satoshiInputKey, setSatoshiInputKey] = useState("satoshiInputKey");

  const spendableBalance =
    stablecoinBalance + (shouldIncludeVolatileBalance ? volatileBalance : 0);

  const spendableSats = CurrencyService("USD").fiatToSats(
    new Decimal(spendableBalance).div(100)
  );

  Log.log("stablecoinBalance", stablecoinBalance);
  Log.log("spendableBalance", spendableBalance);
  Log.log("spendableSats", spendableSats);

  const isInsufficientFunds = satoshiInput > spendableSats;

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const [isInstantPayCanceled, setIsInstantPayCanceled] = useState(false);

  const [
    shouldDisplayConfirmConvertAndSendPayout,
    setShouldDisplayConfirmConvertAndSendPayout,
  ] = useState(false);
  const [
    confirmConvertAndSendPayoutOverlayConvertInfo,
    setConfirmConvertAndSendPayoutOverlayConvertInfo,
  ] = useState(null);
  const [
    handleConfirmConvertAndSendPayoutClicked,
    setHandleConfirmConvertAndSendPayoutClicked,
  ] = useState(() => null);

  // Updating an incorrect address by tapping address bar instead of scanning a QR code
  // Preserves CashTokens category info & entered send amount
  const handleReEditAddress = () => {
    const { state: sendState } = location;

    navigate("/wallet/send", {
      state: sendState,
    });
  };

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

  const handleCancelSending = () => {
    if (isSendingProgressCancelAbortController != null) {
      isSendingProgressCancelAbortController.abort();
    }
  };

  const handleCancelConvertAndSendPayoutClicked = () => {
    setShouldDisplayConfirmConvertAndSendPayout(false);
    handleCancelSending();
  };

  const confirmDelegateSendTokensPayFeesViaCauldronContracts = useCallback(
    async (feePayingTokenCategory: string, tokenRecipient: TokenRecipient) => {
      const Stablecoin = StablecoinService(walletHash);
      const abortControllerRef = useRef(new AbortController());
      setIsSending(true);
      setIsSendingProgressCancelable(true);
      setIsSendingProgressCancelAbortController(abortControllerRef.current);

      const onEnd = async () => {
        await Stablecoin.cancel();
        setIsSending(false);
        setIsSendingProgressCancelable(false);
        setIsSendingProgressCancelAbortController(null);
      };

      try {
        const result = await Stablecoin.sendTokensWithFees(
          feePayingTokenCategory,
          tokenRecipient,
          (offer: StablecoinOffer) => {
            setConfirmConvertAndSendPayoutOverlayConvertInfo({
              showQuoteChangedMessage: false,
              tokenEntity: tokenData,
              spend: { tokenAmount: offer.tradeResult.summary.supply },
              txfee: {
                bchAmount:
                  offer.tradeTransaction.txfee +
                  offer.tradeResult.summary.trade_fee,
              },
              payouts: {
                change: {
                  bchAmount:
                    offer.tradeResult.summary.demand -
                    offer.tradeTransaction.txfee,
                },
              },
            });
            setShouldDisplayConfirmConvertAndSendPayout(true);
          },
          (offer: StablecoinOffer) => {
            setShouldDisplayConfirmConvertAndSendPayout(false);
            setConfirmConvertAndSendPayoutOverlayConvertInfo({
              showQuoteChangedMessage: true,
              tokenEntity: tokenData,
              spend: { tokenAmount: offer.tradeResult.summary.supply },
              txfee: {
                bchAmount:
                  offer.tradeTransaction.txfee +
                  offer.tradeResult.summary.trade_fee,
              },
              payouts: {
                change: {
                  bchAmount:
                    offer.tradeResult.summary.demand -
                    offer.tradeTransaction.txfee,
                },
              },
            });
            setShouldDisplayConfirmConvertAndSendPayout(true);
          },
          abortControllerRef.current.signal
        );

        await Haptic.success();
        navigate("/wallet/send/success", {
          state: { tx: result.tx },
          replace: true,
        });
      } catch (err) {
        if (
          err instanceof Exception &&
          err.message.includes("InsufficientFunds")
        ) {
          handleInsufficientFunds();
        } else {
          await Haptic.error();
          setMessage(
            `${translate(translations.transactionFailed)}: ${err.message}`
          );
        }
        await onEnd();
      }
    },
    [navigate, tokenData, walletHash, handleInsufficientFunds, translate]
  );

  const validateSendConditions = useCallback(
    async (isInstantPay: boolean = false) => {
      if (isSending) {
        return false;
      }

      if (!isConnected) {
        ToastService().disconnected();
        return false;
      }

      if (isBase58Address) {
        await Haptic.warn();
        // we should not support this case in stablecoin mode
        const isLegacyAddressConfirmed = false;

        /*const { value: isLegacyAddressConfirmed } = await Dialog.confirm({
          title: translate(translations.base58WarningTitle),
          message: translate(translations.base58WarningMessage),
          okButtonTitle: translate(translations.base58WarningOk),
          });*/

        if (!isLegacyAddressConfirmed) {
          return false;
        }
      }

      setMessage("");
      setIsSendingProgressCancelable(false);

      setIsSending(true);

      const authAction = isInstantPay
        ? AuthActions.InstantPay
        : AuthActions.SendTransaction;

      const isAuthorized = await SecurityService().authorize(authAction);
      if (!isAuthorized) {
        if (isInstantPay) {
          setIsInstantPayCanceled(true);
        }

        return false;
      }

      // amount > stablecoinBalance
      if (isInsufficientFunds) {
        await handleInsufficientFunds();
        return false;
      }

      return true;
    },
    [isSending, isConnected, isBase58Address, isInsufficientFunds]
  );

  const attemptStablecoinToSatsConversion = useCallback(
    async (recipients) => {
      const TransactionBuilder = TransactionBuilderService(walletHash);
      Log.debug("attempting Stablecoin -> Sats conversion", recipients);

      // get cauldron UTXOs
      // try to build a tx using cauldron UTXO
      // input 0 -> cauldron
      // input 1 -> my stablecoins
      // input 2 -> my sats, if applicable
      // output 0 -> cauldron
      // output 1 -> funds sent
      // output 2 -> sats change back

      return { isConversionSuccess: false };
    },
    [walletHash]
  );

  const buildTransaction = useCallback(async () => {
    const TransactionBuilder = TransactionBuilderService(walletHash);

    const recipients = [{ address, amount: satoshiInput }];

    Log.debug("recipients", recipients);

    const transaction = TransactionBuilder.buildP2pkhTransaction({
      recipients,
    });

    if (transaction === null) {
      Log.warn(transaction);
      setMessage("Transaction Failed: Wallet out of sync?");
      await Haptic.warn();
      return false;
    }

    if (typeof transaction === "bigint") {
      // not enough sats... try to convert stablecoins via cauldron
      /*if (tokenRecipients.length > 0) {
        confirmDelegateSendTokensPayFeesViaCauldronContracts(
          MUSD_TOKENID,
          tokenRecipients
        );
        return false;
        }*/
      const { transaction: conversionTx, isConversionSuccess } =
        await attemptStablecoinToSatsConversion(recipients);

      if (isConversionSuccess) {
        return conversionTx;
      }

      await handleInsufficientFunds();
      return false;
    }

    return transaction;
  }, [address, satoshiInput, walletHash]);

  const broadcastTransaction = useCallback(
    async (transaction) => {
      try {
        const TransactionManager = TransactionManagerService();
        const { isSuccess, result } = await TransactionManager.sendTransaction({
          txid: transaction.tx_hash,
          hex: transaction.tx_hex,
        });

        if (isSuccess) {
          const tx = await TransactionManager.resolveTransaction(result);
          Log.debug("Transaction sent!", tx.txid);
          await Haptic.success();
          await navigate("/wallet/send/success", {
            state: { tx },
            replace: true,
          });
        } else {
          throw new Error(result?.toString());
        }
      } catch (e) {
        const err = `${translate(translations.transactionFailed)}: ${e}`;
        Log.warn(err);
        setMessage(err);
        await Haptic.error();
        setIsSending(false);
        isInstantPayPending.current = false;
      }
    },
    [navigate]
  );

  const confirmSend = useCallback(
    async (isInstantPay: boolean = false) => {
      const isValidSend = await validateSendConditions(isInstantPay);
      if (!isValidSend) {
        setIsSending(false);
        return;
      }

      setIsSending(true);

      const transaction = await buildTransaction();
      if (!transaction) {
        setIsSending(false);
        isInstantPayPending.current = false;
        return;
      }

      broadcastTransaction(transaction);
    },
    [broadcastTransaction, buildTransaction, validateSendConditions]
  );

  useEffect(
    function handleInstantPay() {
      // don't handle instant pay if disabled
      if (!isInstantPayEnabled) {
        return;
      }

      // don't retry instant pay on cancel - navigate back
      if (isInstantPayCanceled) {
        navigate(-1);
        return;
      }

      // don't try instant pay if already attempting send
      if (isSending || isInstantPayPending.current === true) {
        return;
      }

      const requestAmount = bchToSats(searchParams.get("amount") || 0);

      if (requestAmount > 0 && requestAmount <= instantPayThreshold) {
        Log.debug("instapay!", instantPayThreshold, requestAmount);
        isInstantPayPending.current = true;
        confirmSend(true);
      }
    },
    [
      isInstantPayEnabled,
      isInstantPayCanceled,
      isSending,
      instantPayThreshold,
      confirmSend,
      navigate,
      searchParams,
    ]
  );

  const handleSendMax = () => {
    setSatoshiInput(spendableSats);
    setSatoshiInputKey(spendableSats.toString());
  };

  const handleAddressInput = async (input: string) => {
    const { navTo } = await navigateOnValidUri(input);
    if (navTo !== "") {
      const { state: sendState } = location;
      navigate(navTo, { state: sendState });
    } else {
      setIsAddressInvalid(true);
    }
  };

  const handleAddressFocus = () => {
    setIsAddressInvalid(false);
  };

  if (shouldDisplayConfirmConvertAndSendPayout) {
    return (
      <ConfirmConvertAndSendPayoutOverlay
        convertInfo={confirmConvertAndSendPayoutOverlayConvertInfo}
        onConfirm={handleConfirmConvertAndSendPayoutClicked}
        onCancel={handleCancelConvertAndSendPayoutClicked}
      />
    );
  }
  return isScanning ? (
    <ScannerOverlay />
  ) : (
    <FullColumn>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary px-2 py-1">
            <div className="text-lg font-bold flex items-center justify-center">
              {translate(translations.sendingTo)}
              {isMyAddress && <span>&nbsp;{translate(translations.self)}</span>}
              <span className="ml-2">
                <ScannerButton label={false} size="xl" padding="2" />
              </span>
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              {address === "" ? (
                <div className="flex items-center">
                  <div className="flex-1">
                    <Editable
                      value={address}
                      onConfirm={handleAddressInput}
                      onBlur={handleAddressInput}
                      onChange={handleAddressInput}
                      onFocus={handleAddressFocus}
                      open
                      invalid={isAddressInvalid}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center"
                  onClick={handleReEditAddress}
                >
                  <div className="flex-1">
                    <Address address={address} className="tracking-[-0.09em]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-xl font-bold">{message}</div>
          </div>
        )}
      </div>

      {isSending ? (
        <div className="p-2 flex flex-col items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
          {isSendingProgressCancelable ? (
            <div className="my-4">
              <Button
                icon={CloseOutlined}
                iconSize="lg"
                borderClasses="border border-2"
                onClick={handleCancelSending}
              />
            </div>
          ) : (
            false
          )}
        </div>
      ) : (
        <FullColumn>
          <div className="flex flex-col h-full justify-evenly">
            <div className="p-2 w-full grow flex flex-col justify-center ">
              <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
                <div className="flex items-center justify-center">
                  <DollarCircleOutlined className="font-bold text-4xl mr-2" />
                  <SatoshiInput
                    key={satoshiInputKey}
                    onChange={handleAmountInput}
                    satoshis={satoshiInput}
                    size={1}
                    className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner border-2 ${
                      isInsufficientFunds
                        ? "text-error border-error/90"
                        : "text-black/70 border-primary/80"
                    }`}
                    autoFocus={address !== ""}
                    ref={inputRef}
                    max={0n}
                  />
                  <Button
                    label="MAX"
                    className="spacing-wide text-bold text-neutral-800 rounded-full border border-neutral-200 bg-neutral-100"
                    onClick={handleSendMax}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end shrink my-6">
              <div className="flex w-full justify-around items-center px-2 gap-x-2">
                <div className="mx-2">
                  <Button
                    icon={ArrowLeftOutlined}
                    iconSize="lg"
                    label={translate(translations.back)}
                    onClick={() => navigate(-1)}
                  />
                </div>
                <div className="flex-1">
                  <SlideToAction
                    disabled={address === "" || !satoshiInput || isSending}
                    onSlide={() => confirmSend(false)}
                    label={translate(translations.confirm)}
                  />
                </div>
              </div>
            </div>
          </div>
        </FullColumn>
      )}
    </FullColumn>
  );
}
