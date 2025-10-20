import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CopyOutlined,
  CheckCircleFilled,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrencySettings,
  setPreference,
  selectShouldShowMemoCard,
  selectShouldShowOutputsCard,
} from "@/redux/preferences";
import { selectActiveWalletHash } from "@/redux/wallet";

import TransactionHistoryService from "@/services/TransactionHistoryService";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import SeleneLogo from "@/atoms/SeleneLogo";
import TokenAmount from "@/atoms/TokenAmount";

import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

import { useClipboard } from "@/hooks/useClipboard";
import { binToHex } from "@/util/hex";

import LogService from "@/services/LogService";

const Log = LogService("WalletViewSendSuccess");

function WalletViewSendSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { tx, header, prefillMemo } = location.state;
  const [isFocused, setIsFocused] = useState(false);

  const shouldShowOutputs = useSelector(selectShouldShowOutputsCard);
  const shouldShowMemo = useSelector(selectShouldShowMemoCard);

  Log.debug(tx);

  const walletHash = useSelector(selectActiveWalletHash);
  const { localCurrency } = useSelector(selectCurrencySettings);

  const [memo, setMemo] = useState(prefillMemo || "");

  const handleMemoChange = (event) => {
    setMemo(event.target.value);
    TransactionHistoryService(walletHash, localCurrency).setTransactionMemo(
      tx.txid,
      event.target.value
    );
  };

  const { handleCopyToClipboard } = useClipboard();

  const handleCopyTransactionId = async (event) => {
    event.stopPropagation();
    handleCopyToClipboard(tx.txid, translate(translations.transactionId));
  };

  const toggleOutputsVisibility = async (event) => {
    event.stopPropagation();
    dispatch(
      setPreference({
        key: "showOutputsCard",
        value: String(!shouldShowOutputs),
      })
    );
  };

  const toggleMemoVisibility = async (event) => {
    event.stopPropagation();
    dispatch(
      setPreference({ key: "showMemoCard", value: String(!shouldShowMemo) })
    );
  };

  const hasTokens = tx.vout.find((out) => out.token) !== undefined;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 bg-primary dark:bg-primarydark-100 overflow-y-auto overscroll-none"
      onClick={() => navigate("/")}
    >
      <div
        className={`flex items-center justify-center p-4 bg-neutral-800 shadow-lg transition-[height] ${isFocused ? "h-0" : "h-48"}`} // set the height dynamically based on input focus to prevent the virtual keyboard from overlaying the input
      >
        <SeleneLogo className="h-full" cashtokens={hasTokens} />
      </div>
      <div className="p-1 bg-primary dark:bg-primary-900 text-white shadow-inner">
        <div className="p-2 flex justify-center items-center">
          <span className="text-4xl font-bold">
            {header || translate(translations.transactionSent)}
          </span>
        </div>
        <div className="p-2 flex justify-center items-center">
          <span className="text-2xl font-semibold">
            {translate(translations.tapAnywhereToContinue)}
          </span>
        </div>
      </div>
      <div className="p-2">
        <div
          className="border rounded mb-2 border-primary"
          onClick={handleCopyTransactionId}
        >
          <div className="p-1 bg-primary-900 rounded-t border border-t-0 border-primary-900">
            <span className="font-semibold text-neutral-25 flex items-center">
              {translate(translations.transactionId)}
              <CopyOutlined className="ml-1" />
            </span>
          </div>
          <div className="bg-primary-100 p-1 rounded-b-sm border border-t-0 border-primary-900">
            <span className="font-mono text-neutral-600 text-sm tracking-tighter break-all select-none">
              {tx.txid}
            </span>
          </div>
        </div>
        <div
          className="border rounded mb-2 border-primary"
          onClick={toggleMemoVisibility}
        >
          <div className="p-1 bg-primary-900 rounded-t border border-t-0 border-primary-900">
            <span className="font-semibold text-neutral-25 flex items-center">
              {translate(translations.memo)}
              {shouldShowMemo ? (
                <CaretDownOutlined className="ml-1" />
              ) : (
                <CaretRightOutlined className="ml-1" />
              )}
            </span>
          </div>
          {shouldShowMemo && (
            <div className="flex items-center bg-white dark:bg-neutral-500 text-primary dark:text-neutral-25 p-1 rounded-b-sm border border-t-0 border-primary-900">
              <input
                type="text"
                className="flex-1 rounded-sm p-1"
                value={memo}
                onChange={handleMemoChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onClick={(e) => e.stopPropagation()}
              />
              {memo && (
                <CheckCircleFilled className="shrink text-primary text-lg ml-2 mr-1 font-bold" />
              )}
            </div>
          )}
        </div>
        <div
          className="border rounded mb-2 border-primary"
          onClick={toggleOutputsVisibility}
        >
          <div className="p-1 bg-primary-900 rounded-t border border-t-0 border-primary-900">
            <span className="font-semibold text-neutral-25 flex items-center">
              {translate(translations.outputs)}
              {shouldShowOutputs ? (
                <CaretDownOutlined className="ml-1" />
              ) : (
                <CaretRightOutlined className="ml-1" />
              )}
            </span>
          </div>
          {shouldShowOutputs && (
            <div className="bg-primary-700 border border-primary-900">
              {tx.vout.map((output, i) => (
                <OutputListItem key={output.n} output={output} i={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendSuccess;

/* eslint-disable react/prop-types */
function OutputListItem({ output, i }) {
  const zebraCss =
    i % 2 === 0
      ? "bg-primary-100 dark:bg-primarydark-100"
      : "bg-primary-50 dark:bg-primarydark-50";

  // Determine address format based on whether tokens are present
  const addressFormat = output.token ? "tokenaddr" : undefined;

  return (
    <div className={`p-1.5 ${zebraCss}`}>
      <div className="flex text-sm items-center">
        <Address
          address={output.scriptPubKey.addresses[0]}
          format={addressFormat}
          className="tracking-tight"
        />
      </div>
      <div className="flex justify-between">
        <div className="dark:text-neutral-100">
          <span className="text-xs tracking-tighter mr-1.5 opacity-70">
            #{output.n}
          </span>
          <span className="font-mono">
            <Satoshi value={output.valueSatoshis} />
          </span>
          <span className="mx-1 text-neutral-500">/</span>
          <span className="text-sm opacity-80">
            <Satoshi value={output.valueSatoshis} flip />
          </span>
        </div>
        {output.token && (
          <div
            className="text-sm"
            style={{
              color: `#${binToHex(output.token.category).slice(0, 6)}`,
            }}
          >
            <TokenAmount token={output.token} />
          </div>
        )}
      </div>
    </div>
  );
}
