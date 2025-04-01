import { useState, useEffect, useRef } from "react";
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
} from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
} from "@/redux/preferences";

import { selectSyncState, selectMyAddresses } from "@/redux/sync";

import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import TokenManagerService from "@/services/TokenManagerService";
import ToastService from "@/services/ToastService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import LogService from "@/services/LogService";

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

import { hexToBin } from "@/util/hex";
import { Haptic } from "@/util/haptic";
import { bchToSats } from "@/util/sats";
import { validateBchUri, navigateOnValidUri } from "@/util/uri";
import { truncateProse } from "@/util/string";
import { translate } from "@/util/translations";
import translations from "./translations";

const Log = LogService("WalletViewSend");

export default function WalletViewSend() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const wallet = useSelector(selectActiveWallet);
  const sync = useSelector(selectSyncState);

  const TokenManager = TokenManagerService(wallet.walletHash);

  const { state: sendState } = location;
  const selection = sendState?.selection || [];
  const tokenCategories = sendState?.tokenCategories || [];
  const selectionAmount = selection.reduce((sum, cur) => sum + cur.amount, 0n);

  const hasTokens = tokenCategories.length > 0;
  const nftSelection = selection.filter((s) => s.nft_capability !== null);

  // TODO: add ability to send additional BCH with tokens
  //const [isSendingAdditionalBch, setIsSendingAdditionalBch] = useState(false);
  const isSendingAdditionalBch = false;

  Log.debug("selection", selection, tokenCategories);

  const tokenData = hasTokens
    ? tokenCategories.map((category) => TokenManager.getToken(category))[0]
    : null;

  const { address, isBase58Address, isTokenAddress } = validateBchUri(
    params.address || ""
  );

  const myAddresses = useSelector(selectMyAddresses);
  const isMyAddress = myAddresses[address] !== undefined;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : BigInt(0);

  const [satoshiInput, setSatoshiInput] = useState(querySats);
  // used to force re-render of SatoshiInput component with MAX button
  const [satoshiInputKey, setSatoshiInputKey] = useState("satoshiInputKey");

  const isInsufficientTokens = false;

  const isInsufficientFunds =
    selectionAmount > 0
      ? satoshiInput > selectionAmount
      : satoshiInput > wallet.spendable_balance;

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const [isInstantPayCanceled, setIsInstantPayCanceled] = useState(false);

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

    if (hasTokens && !isTokenAddress) {
      await Haptic.warn();
      setMessage("Can't send tokens to non-token address!");
      return;
    }

    setIsSending(true);

    const authAction = isInstantPay
      ? AuthActions.InstantPay
      : AuthActions.SendTransaction;

    const isAuthorized = await SecurityService().authorize(authAction);
    if (!isAuthorized) {
      setIsSending(false);

      if (isInstantPay) {
        setIsInstantPayCanceled(true);
      }
      return;
    }

    if ((!hasTokens && isInsufficientFunds) || isInsufficientTokens) {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    if (!sync.isConnected) {
      ToastService().disconnected();
      setIsSending(false);
      return;
    }

    if (isBase58Address) {
      await Haptic.warn();
      const { value: isLegacyAddressConfirmed } = await Dialog.confirm({
        title: translate(translations.base58WarningTitle),
        message: translate(translations.base58WarningMessage),
        okButtonTitle: translate(translations.base58WarningOk),
      });

      if (!isLegacyAddressConfirmed) {
        setIsSending(false);
        return;
      }
    }

    const TransactionManager = TransactionManagerService();
    const TransactionBuilder = TransactionBuilderService(wallet);

    const coinRecipients = hasTokens ? [] : [{ address, amount: satoshiInput }];

    const tokenRecipients = tokenCategories.map((category) => ({
      address,
      amount: 0n,
      token: { category, amount: satoshiInput },
    }));

    const nftRecipients = nftSelection.map((s) => ({
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
      recipients: [...coinRecipients, ...tokenRecipients, ...nftRecipients],
    });

    if (transaction === null) {
      Log.warn(transaction);
      setMessage("Transaction Failed: Wallet out of sync?");
      setIsSending(false);
      await Haptic.warn();
      return;
    }

    if (typeof transaction === "bigint") {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    try {
      const { isSuccess, result } = await TransactionManager.sendTransaction(
        { txid: transaction.tx_hash, hex: transaction.tx_hex },
        wallet.walletHash
      );

      if (isSuccess) {
        const tx = await TransactionManager.resolveTransaction(result);
        await Haptic.success();
        navigate("/wallet/send/success", {
          state: { tx },
          replace: true,
        });
      } else {
        throw new Error(result);
      }
    } catch (e) {
      //setMessage(translate(translations.transactionFailed));
      setMessage(`${translate(translations.transactionFailed)}: ${e.message}`);
      await Haptic.error();
    } finally {
      setIsSending(false);
    }
  };

  useEffect(function handleInstantPay() {
    if (!isInstantPayEnabled) {
      return;
    }
    if (isInstantPayCanceled) {
      navigate(-1);
      return;
    }

    const requestAmount = bchToSats(searchParams.get("amount") || 0);

    if (requestAmount > 0 && requestAmount <= instantPayThreshold) {
      //Log.debug("instapay!", threshold, requestAmount);
      confirmSend(true);
    }
  });

  const handleSendMaxTokens = () => {
    setSatoshiInput(0n);
    // force re-render of SatoshiInput component
    setSatoshiInputKey("0");
  };

  const handleSendMax = () => {
    let amount =
      selectionAmount > 0
        ? BigInt(selectionAmount)
        : BigInt(wallet.spendable_balance);

    const TransactionBuilder = TransactionBuilderService(wallet);
    const AddressManager = AddressManagerService(wallet.walletHash);

    const tryAddress =
      address || AddressManager.getUnusedAddresses(1, 0)[0].address;

    let transaction = TransactionBuilder.buildP2pkhTransaction({
      selection: [...selection],
      recipients: [{ address: tryAddress, amount }],
    });

    while (typeof transaction !== "object") {
      amount = transaction;
      transaction = TransactionBuilder.buildP2pkhTransaction({
        selection: [...selection],
        recipients: [{ address: tryAddress, amount }],
      });
    }

    const clampedAmount = amount < 0 ? 0n : amount;
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

  const handleAddressInput = async (input) => {
    const navTo = await navigateOnValidUri(input);
    if (navTo !== "") {
      navigate(navTo, { replace: true, state: sendState });
    }
  };

  return (
    <FullColumn>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary px-2 py-1">
            <div className="text-lg font-bold">
              {translate(translations.sendingTo)}
              {isMyAddress && <span>&nbsp;{translate(translations.self)}</span>}
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              {address === "" ? (
                <Editable
                  value={address}
                  onConfirm={handleAddressInput}
                  onBlur={handleAddressInput}
                  open
                />
              ) : (
                <Address address={address} />
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
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <FullColumn>
          <div className="flex flex-col h-full justify-evenly">
            <div className="p-2 w-full grow flex flex-col justify-center ">
              {selectionAmount > 0 && <InputSelection inputs={selection} />}
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
                      className={`mx-1.5 p-1 flex-1 text-3xl rounded shadow-inner ${
                        isInsufficientTokens ? "text-error" : "text-black/70"
                      }`}
                      autoFocus={address !== ""}
                      ref={inputRef}
                      max={0}
                      tokenDecimals={tokenData.token.decimals}
                    />
                    <Button
                      label="MAX"
                      className="spacing-wide text-bold text-zinc-800 rounded-full border border-zinc-200 bg-zinc-100"
                      onClick={handleSendMaxTokens}
                    />
                  </div>
                </div>
              )}
              {(tokenData === null || isSendingAdditionalBch) && (
                <>
                  <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
                    <div className="flex items-center justify-center">
                      <CurrencySymbol className="font-bold text-4xl mr-2" />
                      <SatoshiInput
                        key={satoshiInputKey}
                        onChange={handleAmountInput}
                        satoshis={satoshiInput}
                        size={1}
                        className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner ${
                          isInsufficientFunds ? "text-error" : "text-black/70"
                        }`}
                        autoFocus={address !== ""}
                        ref={inputRef}
                        max={selectionAmount}
                      />
                      <Button
                        label="MAX"
                        className="spacing-wide text-bold text-zinc-800 rounded-full border border-zinc-200 bg-zinc-100"
                        onClick={handleSendMax}
                      />
                    </div>
                  </div>
                  <div
                    className="p-2 relative text-center w-full"
                    onClick={handleFlipCurrency}
                  >
                    <span className="text-2xl font-semibold text-center w-full text-zinc-800/80 flex justify-center items-center">
                      <Satoshi value={satoshiInput} flip />
                      <CurrencyFlip className="text-3xl ml-2" />
                    </span>
                  </div>
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
                  <span className="font-bold">
                    <Button
                      label={translate(translations.confirm)}
                      inverted
                      fullWidth
                      onClick={() => confirmSend(false)}
                      disabled={address === "" || isSending}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FullColumn>
      )}
    </FullColumn>
  );
}

/* eslint-disable react/prop-types */
function InputSelection({ inputs }) {
  const { walletHash } = useSelector(selectActiveWallet);
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
            <div className="p-1 text-sm flex-1">
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
  const { walletHash } = useSelector(selectActiveWallet);
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
                  <span className="text-sm text-zinc-700 text-wrap">
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
