import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  ArrowLeftOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import {
  selectActiveWallet,
  selectActiveWalletHash,
  selectActiveWalletBalance,
  selectWalletAddresses,
} from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  selectBchNetwork,
  selectShouldForceTokenAddress,
  setPreference,
} from "@/redux/preferences";

import { selectScannerIsScanning } from "@/redux/device";

import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService, {
  Recipient,
} from "@/services/TransactionBuilderService";
import TokenManagerService from "@/services/TokenManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import LogService from "@/services/LogService";
import CauldronService from "@/services/CauldronService";

import { useStablecoinBalance } from "@/hooks/useStablecoinBalance";

import FullColumn from "@/layout/FullColumn";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Editable from "@/atoms/Editable";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import SlideToAction from "@/components/atoms/SlideToAction";
import ScannerButton from "@/views/wallet/home/ScannerButton";
import ScannerOverlay from "@/views/wallet/home/ScannerOverlay";

import { hexToBin } from "@/util/hex";
import { Haptic } from "@/util/haptic";
import { bchToSats } from "@/util/sats";
import { MUSD_TOKENID } from "@/util/tokens";
import { validateBchUri, navigateOnValidUri } from "@/util/uri";
import { truncateProse } from "@/util/string";
import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

const Log = LogService("WalletViewSend");

export default function WalletViewSend() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // ----------------

  const wallet = useSelector(selectActiveWallet);
  const { walletHash } = wallet;
  const isScanning = useSelector(selectScannerIsScanning);
  const bchNetwork = useSelector(selectBchNetwork);

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  // ----------------

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const [isInstantPayCanceled, setIsInstantPayCanceled] = useState(false);
  const isInstantPayPending = useRef(false);

  const { address, isBase58Address, isTokenAddress, isValid } = validateBchUri(
    params.address || ""
  );

  // ----------------

  const { shouldPreferLocalCurrency, isStablecoinMode } = useSelector(
    selectCurrencySettings
  );

  const { spendable_balance } = useSelector(selectActiveWalletBalance);

  const { stablecoinBalance, totalSpendableSats } =
    useStablecoinBalance(walletHash);

  // ----------------

  const myAddresses = useSelector(selectWalletAddresses);
  const isMyAddress =
    myAddresses.find((a) => a.address === address) !== undefined;

  const [isAddressInvalid, setIsAddressInvalid] = useState(
    address !== "" && !isValid
  );

  // ----------------

  const inputRef = useRef<HTMLInputElement>(null);

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : BigInt(0);

  const queryTokenCategory = searchParams.get("c");
  const queryTokenAmount = queryTokenCategory
    ? BigInt(searchParams.get("ft") || 0)
    : 0n;

  const [satoshiInput, setSatoshiInput] = useState(
    queryTokenAmount || querySats
  );
  // used to force re-render of SatoshiInput component with MAX button
  const [satoshiInputKey, setSatoshiInputKey] = useState("satoshiInputKey");

  const handleAmountInput = (satInput) => {
    setSatoshiInput(satInput);
    setSatoshiInputKey("satoshiInputKey");
    setMessage("");
  };

  // ----------------

  const selection = useMemo(() => {
    const { state: sendState } = location;
    return sendState?.selection || [];
  }, [location]);

  const nftSelection = useMemo(() => {
    const { state: sendState } = location;
    return sendState?.nftSelection || [];
  }, [location]);

  const tokenCategories = useMemo(() => {
    const { state: sendState } = location;

    if (queryTokenAmount > 0) {
      return [queryTokenCategory];
    }

    const categories = sendState?.tokenCategories || [];
    return categories;
  }, [location, queryTokenAmount, queryTokenCategory]);

  const selectionAmount = selection.reduce((sum, cur) => sum + cur.amount, 0n);

  const hasTokens = tokenCategories.length > 0;
  const hasNft = nftSelection.length > 0;

  Log.debug("selection", selection, tokenCategories);

  // TODO: add ability to send additional BCH with tokens
  //const [isSendingAdditionalBch, setIsSendingAdditionalBch] = useState(false);
  const isSendingAdditionalBch = false;

  const shouldForceTokenAddress = useSelector(selectShouldForceTokenAddress);

  // ----------------

  const TokenManager = TokenManagerService(walletHash, bchNetwork);
  const tokenData = hasTokens
    ? tokenCategories.map((category) => TokenManager.getToken(category))[0] // TODO: support sending multiple token categories
    : null;

  const { amount: token_amount } = hasTokens
    ? TokenManager.calculateTokenAmounts(tokenData.category)
    : { amount: 0n };

  const tokenSelection = hasTokens
    ? TokenManager.getTokenUtxos(tokenData.category)
    : [];

  const isInsufficientTokens =
    hasTokens && !hasNft && satoshiInput > token_amount;

  const isInsufficientStable = satoshiInput > totalSpendableSats;

  const isInsufficientSats =
    selectionAmount > 0
      ? satoshiInput > selectionAmount
      : satoshiInput > spendable_balance;

  // When sending tokens, don't check BCH balance against token amount
  // Token balance is checked via isInsufficientTokens, and BCH fees are handled during transaction building
  const isInsufficientFunds = hasTokens
    ? false // Token sends don't need BCH balance check here (fees handled in transaction builder)
    : isStablecoinMode
      ? isInsufficientStable
      : isInsufficientSats;

  const handleInsufficientFunds = async () => {
    await Haptic.warn();
    const insufficientFundsTranslation = translate(
      translations.insufficientFunds
    );
    setMessage(insufficientFundsTranslation);
  };

  // ----------------

  const validateSendConditions = useCallback(
    async (isInstantPay: boolean = false) => {
      if (isSending) {
        return false;
      }

      // can't send tokens to non-token address
      if (
        (hasTokens || hasNft) &&
        !isTokenAddress &&
        !shouldForceTokenAddress
      ) {
        await Haptic.warn();
        setMessage(translate(translations.cantSendTokensToNonTokenAddress));
        return false;
      }

      setIsSending(true);

      if (isBase58Address) {
        await Haptic.warn();
        const { value: isLegacyAddressConfirmed } = await Dialog.confirm({
          title: translate(translations.base58WarningTitle),
          message: translate(translations.base58WarningMessage),
          okButtonTitle: translate(translations.base58WarningOk),
        });

        if (!isLegacyAddressConfirmed) {
          return false;
        }
      }

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

      if ((hasTokens && isInsufficientTokens) || isInsufficientFunds) {
        await handleInsufficientFunds();
        return false;
      }

      return true;
    },
    [
      isSending,
      hasTokens,
      hasNft,
      isTokenAddress,
      isBase58Address,
      isInsufficientFunds,
      isInsufficientTokens,
      shouldForceTokenAddress,
    ]
  );

  const buildTransaction = useCallback(async () => {
    const TransactionBuilder = TransactionBuilderService(walletHash);

    const coinRecipients: Array<Recipient> = hasTokens
      ? []
      : [{ address, amount: satoshiInput }];

    const tokenRecipients: Array<Recipient> =
      hasTokens && satoshiInput > 0
        ? tokenCategories.map((category) => ({
            address,
            amount: 0n,
            token: { category, amount: satoshiInput },
          }))
        : [];

    const nftRecipients: Array<Recipient> = nftSelection.map((s) => ({
      address,
      amount: 0n,
      token: {
        category: s.token_category,
        nft: {
          capability: s.nft_capability,
          commitment: s.nft_commitment ? hexToBin(s.nft_commitment) : undefined,
        },
      },
    }));

    Log.debug("recipients", coinRecipients, tokenRecipients, nftRecipients);

    const transaction = TransactionBuilder.buildP2pkhTransaction({
      selection,
      nftSelection,
      recipients: [...coinRecipients, ...tokenRecipients, ...nftRecipients],
    });

    if (transaction === null) {
      Log.warn(transaction);
      setMessage("Transaction Failed: Wallet out of sync?");
      await Haptic.warn();
      return false;
    }

    if (typeof transaction === "bigint") {
      await handleInsufficientFunds();
      return false;
    }

    return transaction;
  }, [
    address,
    hasTokens,
    nftSelection,
    satoshiInput,
    selection,
    tokenCategories,
    walletHash,
  ]);

  const prepareStablecoinRecipients = useCallback(
    (amount: bigint): Array<Recipient> => {
      const recipients = new Array<Recipient>();

      const Cauldron = CauldronService();
      const cauldronPrice = Cauldron.getTokenPrice(MUSD_TOKENID);

      const q = amount / cauldronPrice;
      const r = amount % cauldronPrice;
      const half = q / 2n;

      const fiatNeeded = r >= half ? q : q;

      const AddressManager = AddressManagerService(walletHash);
      const tryAddress =
        address || AddressManager.getUnusedAddresses(1, 0)[0].address;

      // prioritize sending MUSD directly for token addresses
      // in this case we are assuming receiver is signalling their preference
      // to receive stablecoin token instead of raw sats
      if (isTokenAddress && stablecoinBalance > 0) {
        // one token output if stablecoin balance covers entire amount
        if (stablecoinBalance >= fiatNeeded) {
          Log.debug("stablecoin: direct token", fiatNeeded, stablecoinBalance);
          recipients.push({
            address: tryAddress,
            amount: -1n,
            token: { category: MUSD_TOKENID, amount: fiatNeeded },
          });
        } else if (totalSpendableSats >= amount) {
          // cover the difference with raw sats if balance is available (hybrid output)
          const amountShort = fiatNeeded - stablecoinBalance;
          const satsShort = amountShort * cauldronPrice;

          Log.debug(
            "hybrid: stablecoinBalance, amountShort, satsShort",
            stablecoinBalance,
            amountShort,
            satsShort
          );

          // if receiver uses stablecoin mode, they will convert the sats themselves
          // if they don't use stable mode, they don't care about receiving sats
          // if they give us a q address, they get sats regardless
          recipients.push({
            address: tryAddress,
            amount: satsShort,
            token: { category: MUSD_TOKENID, amount: stablecoinBalance },
          });
        }
      } else {
        Log.debug("direct sats:", amount);
        // only output raw sats for non-token addresses
        recipients.push({
          address: tryAddress,
          amount,
        });
      }

      Log.debug("prepareStablecoinRecipients", recipients, fiatNeeded, amount);
      return recipients;
    },
    [address, isTokenAddress, stablecoinBalance, totalSpendableSats, walletHash]
  );

  const buildStablecoinTransaction = useCallback(async () => {
    // true insufficient funds
    if (satoshiInput > totalSpendableSats) {
      handleInsufficientFunds();
      return false;
    }

    const recipients = prepareStablecoinRecipients(satoshiInput);
    const TransactionBuilder = TransactionBuilderService(walletHash);
    let transaction = TransactionBuilder.buildP2pkhTransaction({
      recipients,
    });

    Log.debug("buildStablecoinTransaction", recipients, transaction);

    if (typeof transaction === "bigint") {
      // we have enough stablecoin to attempt a swap-in-place
      const satsShort = transaction - spendable_balance;
      Log.debug(
        "buildStablecoinTransaction swapOutgoing",
        spendable_balance,
        transaction,
        satsShort
      );

      transaction = await TransactionBuilder.buildStablecoinTransaction(
        recipients,
        satsShort
      );
    }

    return transaction;
  }, [
    satoshiInput,
    walletHash,
    totalSpendableSats,
    prepareStablecoinRecipients,
    spendable_balance,
  ]);

  const broadcastTransaction = useCallback(
    async (transaction) => {
      try {
        const TransactionManager = TransactionManagerService();
        const { isSuccess, result } = await TransactionManager.sendTransaction(
          {
            txid: transaction.tx_hash,
            hex: transaction.tx_hex,
          },
          bchNetwork
        );

        Log.debug("sendTransaction", result);

        if (isSuccess) {
          const tx = await TransactionManager.resolveTransaction(
            result,
            bchNetwork
          );
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
    [navigate, bchNetwork]
  );

  const confirmSend = useCallback(
    async (isInstantPay: boolean = false) => {
      const isValidSend = await validateSendConditions(isInstantPay);
      if (!isValidSend) {
        setIsSending(false);
        return;
      }

      setIsSending(true);

      const transaction =
        isStablecoinMode && !hasTokens
          ? await buildStablecoinTransaction()
          : await buildTransaction();

      if (!transaction) {
        setIsSending(false);
        isInstantPayPending.current = false;
        return;
      }

      broadcastTransaction(transaction);
    },
    [
      validateSendConditions,
      isStablecoinMode,
      hasTokens,
      buildStablecoinTransaction,
      buildTransaction,
      broadcastTransaction,
    ]
  );

  // ----------------

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

  // ----------------

  const handleSendMaxTokens = () => {
    setSatoshiInput(token_amount);
    // force re-render of SatoshiInput component
    setSatoshiInputKey(token_amount.toString());
  };

  const handleSendMax = () => {
    Log.debug("handleSendMax");

    let amount =
      selectionAmount > 0 ? BigInt(selectionAmount) : BigInt(spendable_balance);

    const TransactionBuilder = TransactionBuilderService(walletHash);
    const AddressManager = AddressManagerService(walletHash);

    const tryAddress =
      address || AddressManager.getUnusedAddresses(1, 0)[0].address;

    let transaction = TransactionBuilder.buildP2pkhTransaction({
      selection,
      recipients: [{ address: tryAddress, amount }],
    });

    while (typeof transaction !== "object") {
      if (selection.length === 0) {
        const short = transaction - amount;
        amount -= short;
      } else {
        amount -= transaction;
      }

      transaction = TransactionBuilder.buildP2pkhTransaction({
        selection,
        recipients: [{ address: tryAddress, amount }],
      });
    }

    const clampedAmount = amount < 0 ? 0n : amount;
    setSatoshiInput(clampedAmount);
    // force re-render of SatoshiInput component
    setSatoshiInputKey(clampedAmount.toString());
    Log.debug("handleSendMax:", clampedAmount);
  };

  const handleSendMaxStablecoin = async () => {
    Log.debug("handleSendMaxStablecoin");
    if (stablecoinBalance === 0n) {
      handleSendMax();
      return;
    }

    const Cauldron = CauldronService();
    const liquidationTrade = await Cauldron.prepareTrade(
      MUSD_TOKENID,
      "BCH",
      stablecoinBalance,
      wallet,
      true
    );

    const liquidationFee = BigInt(
      liquidationTrade.tradeResult.summary.trade_fee
    );
    const liquidationSats = BigInt(liquidationTrade.tradeResult.summary.demand);

    const txFee = liquidationTrade.tradeTx.txfee;

    Log.debug(
      "liquidating",
      stablecoinBalance,
      "MUSD ->",
      liquidationSats,
      "sats w/",
      liquidationFee,
      "trade fee and",
      txFee,
      "tx fee"
    );

    const totalSats =
      spendable_balance + liquidationSats - liquidationFee - txFee;

    const recipients = prepareStablecoinRecipients(totalSats);

    const TransactionBuilder = TransactionBuilderService(walletHash);

    const finalTransaction =
      await TransactionBuilder.buildStablecoinTransaction(
        recipients,
        liquidationSats,
        txFee
      );

    const newAmount = finalTransaction.payouts_info.reduce(
      (sum, cur) => sum + cur.output.amount,
      0n
    );

    Log.debug(
      "handleSendMaxStablecoin",
      recipients,
      finalTransaction,
      newAmount
    );

    setSatoshiInput(newAmount);
    // force re-render of SatoshiInput component
    setSatoshiInputKey(newAmount.toString());
  };

  // ----------------

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

  // ----------------

  const handleAddressInput = async (input: string) => {
    const { navTo } = await navigateOnValidUri(input);
    if (navTo !== "") {
      const { state: sendState } = location;
      navigate(navTo, { state: sendState });
    } else {
      setIsAddressInvalid(true);
    }
  };

  // Updating an incorrect address by tapping address bar instead of scanning a QR code
  // Preserves CashTokens category info & entered send amount
  const handleReEditAddress = () => {
    const { state: sendState } = location;

    navigate("/wallet/send", {
      state: sendState,
    });
  };

  const handleAddressFocus = () => {
    setIsAddressInvalid(false);
  };

  // ----------------

  if (isScanning) {
    return <ScannerOverlay />;
  }

  if (isSending) {
    return (
      <div className="p-2 flex flex-col items-center justify-center absolute top-1/3 w-full text-center">
        <SyncOutlined className="text-7xl" spin />
      </div>
    );
  }

  return (
    <FullColumn>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary dark:bg-primarydark-200 px-2 py-1">
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
                      onChange={handleAddressInput}
                      onFocus={handleAddressFocus}
                      open
                      invalid={isAddressInvalid}
                      confirmOnBlur
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

      <FullColumn>
        <div className="flex flex-col h-full justify-evenly">
          <div className="p-2 w-full grow flex flex-col justify-center ">
            {isStablecoinMode && !hasTokens && selection.length === 0 ? (
              <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 dark:bg-primarydark-200 text-white">
                <div className="flex items-center justify-center">
                  <DollarCircleOutlined className="font-bold text-4xl mr-2" />
                  <SatoshiInput
                    key={satoshiInputKey}
                    onChange={handleAmountInput}
                    satoshis={satoshiInput}
                    size={1}
                    className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner border-2 dark:bg-neutral-600 dark:text-neutral-100 ${
                      isInsufficientFunds
                        ? "text-error border-error/90"
                        : "text-black/70 border-primary/80"
                    }`}
                    autoFocus={address !== ""}
                    ref={inputRef}
                    max={totalSpendableSats}
                  />
                  <Button
                    label="MAX"
                    className="spacing-wide text-bold text-neutral-800 rounded-full border border-neutral-200 bg-neutral-100"
                    onClick={handleSendMaxStablecoin}
                  />
                </div>
              </div>
            ) : (
              <>
                {selectionAmount > 0 && <InputSelection inputs={selection} />}
                {hasNft && <InputSelection inputs={nftSelection} />}
                {tokenCategories.length > 0 && (
                  <InputSelection inputs={tokenSelection} />
                )}
                {tokenData !== null && nftSelection.length === 0 && (
                  <div
                    className="py-4 px-2 rounded-md shadow-md text-white"
                    style={{ backgroundColor: tokenData.color }}
                  >
                    <div className="flex items-center justify-center">
                      <TokenIcon category={tokenCategories[0]} size={48} />
                      <SatoshiInput
                        key={satoshiInputKey}
                        onChange={handleAmountInput}
                        satoshis={satoshiInput}
                        size={1}
                        className={`mx-1.5 p-1 flex-1 text-3xl rounded shadow-inner border-2 dark:bg-neutral-600 dark:text-neutral-100 ${
                          isInsufficientTokens
                            ? "text-error border-error/90"
                            : "text-black/70 border-primary/80"
                        }`}
                        autoFocus={address !== ""}
                        ref={inputRef}
                        max={0n}
                        tokenDecimals={tokenData.token.decimals}
                      />
                      <Button
                        label="MAX"
                        className="spacing-wide text-bold  rounded-full border border-neutral-200 bg-neutral-100"
                        onClick={() => handleSendMaxTokens()}
                      />
                    </div>
                  </div>
                )}
                {(tokenData === null || isSendingAdditionalBch) && (
                  <>
                    <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 dark:bg-primarydark-200 text-white">
                      <div className="flex items-center justify-center">
                        <CurrencySymbol className="font-bold text-4xl mr-2" />
                        <SatoshiInput
                          key={satoshiInputKey}
                          onChange={handleAmountInput}
                          satoshis={satoshiInput}
                          size={1}
                          className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner border-2 dark:bg-neutral-600 dark:text-neutral-100 ${
                            isInsufficientFunds
                              ? "text-error border-error/90"
                              : "text-black/70 border-primary/80"
                          }`}
                          autoFocus={address !== ""}
                          ref={inputRef}
                          max={selectionAmount}
                        />
                        <Button
                          label="MAX"
                          className="spacing-wide text-bold text-neutral-800 rounded-full border border-neutral-200 bg-neutral-100"
                          onClick={handleSendMax}
                        />
                      </div>
                    </div>
                    <div
                      className="p-2 relative text-center w-full"
                      onClick={handleFlipCurrency}
                    >
                      <span className="text-2xl font-semibold text-center w-full text-neutral-800/80 dark:text-neutral-100 flex justify-center items-center">
                        <Satoshi value={satoshiInput} flip forceVisible />
                        <CurrencyFlip className="text-3xl ml-2" />
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
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
                  disabled={
                    address === "" || (!satoshiInput && !hasNft) || isSending
                  }
                  onSlide={() => confirmSend(false)}
                  label={translate(translations.slideToConfirm)}
                />
              </div>
            </div>
          </div>
        </div>
      </FullColumn>
    </FullColumn>
  );
}

/* eslint-disable react/prop-types */
function InputSelection({ inputs }) {
  const walletHash = useSelector(selectActiveWalletHash);
  const TokenManager = TokenManagerService(walletHash);

  const coins = inputs.filter((utxo) => utxo.token_category === null);
  const tokenUtxos = inputs.filter((utxo) => utxo.token_category !== null);

  const tokenCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      categories.includes(utxo.token_category)
        ? categories
        : [...categories, utxo.token_category],
    []
  );

  const tokens = tokenCategories.map((category) => ({
    ...TokenManager.getToken(category),
    token_amount: tokenUtxos.reduce((sum, utxo) => sum + utxo.token_amount, 0n),
    nftCount: tokenUtxos.reduce(
      (sum, utxo) => sum + (utxo.nft_capability !== null ? 1 : 0),
      0
    ),
  }));

  const nftUtxos = inputs.filter(
    (utxo) => utxo.token_category !== null && utxo.nft_capability !== null
  );

  Log.debug("InputSelection", coins, tokens, nftUtxos);

  return (
    <>
      {inputs.some((i) => i.nft_capability !== null) && (
        <NftSelectionDisplay nftUtxos={nftUtxos} />
      )}
      {inputs.some(
        (i) => i.nft_capability === null || i.token_category === null
      ) && (
        <div className="mx-4 border border-primary rounded">
          {coins.map((utxo) => (
            <div className="p-1 text-sm dark:text-neutral-100 flex-1">
              <div className="flex items-center">
                <MoneyCollectOutlined className="mr-1" />
                <div className="flex items-center justify-between w-full">
                  <Satoshi value={utxo.amount} />
                  <span className="text-sm opacity-75">
                    <Satoshi value={utxo.amount} flip />
                  </span>
                </div>
              </div>
            </div>
          ))}
          {tokens.map((token) => (
            <div className="p-1.5 flex-1">
              <div className="flex items-center gap-x-1">
                <TokenIcon size={32} category={token.category} />
                <span
                  style={{ color: `#${token.category.slice(0, 6)}` }}
                  className="font-mono text-sm mr-1"
                >
                  {token.symbol}
                </span>
                <span className="text-sm grow flex justify-end">
                  <TokenAmount token={token} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NftSelectionDisplay({ nftUtxos }) {
  const walletHash = useSelector(selectActiveWalletHash);
  const TokenManager = TokenManagerService(walletHash);
  return (
    <div className="mt-1 pb-3 flex flex-wrap gap-1 justify-around">
      {nftUtxos.map((utxo) => {
        const tokenData = TokenManager.getToken(utxo.token_category);

        const nftData = tokenData.token.nfts
          ? tokenData.token.nfts.parse.types[utxo.nft_commitment]
          : null;

        return (
          <div
            className="border rounded-t rounded-b-sm items-center w-full sm:max-w-[49%]"
            style={{ borderColor: tokenData.color }}
          >
            <div
              style={{ backgroundColor: `${tokenData.color}AA` }}
              className="truncate text-white font-semibold px-0.5 text-stroke"
            >
              {nftData && nftData.name && (
                <span className="px-0.5">{nftData.name}</span>
              )}
            </div>
            <div className="flex">
              <div className="p-0.5">
                <TokenIcon
                  category={utxo.token_category}
                  nft_commitment={utxo.nft_commitment}
                />
              </div>
              <div className="truncate px-1">
                {nftData && nftData.description ? (
                  <span className="text-sm text-neutral-700 text-wrap">
                    {truncateProse(nftData.description)}
                  </span>
                ) : (
                  <span className="break-all text-wrap text-xs tracking-tight font-mono">
                    {utxo.nft_commitment}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
