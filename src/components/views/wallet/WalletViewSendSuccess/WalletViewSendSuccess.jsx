import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CopyOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWalletHash } from "@/redux/wallet";

import TransactionHistoryService from "@/services/TransactionHistoryService";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import SeleneLogo from "@/atoms/SeleneLogo";
import TokenAmount from "@/atoms/TokenAmount";

import { translate } from "@/util/translations";
import translations from "./translations";

import { useClipboard } from "@/hooks/useClipboard";
import { binToHex } from "@/util/hex";

import LogService from "@/services/LogService";

const Log = LogService("WalletViewSendSuccess");

function WalletViewSendSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tx, header, prefillMemo } = location.state;
  const [isFocused, setIsFocused] = useState(false);

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

  const hasTokens = tx.vout.find((out) => out.token) !== undefined;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 bg-primary overflow-y-auto overscroll-none"
      onClick={() => navigate("/")}
    >
      <div
        className={`flex items-center justify-center p-4 bg-zinc-800 shadow-lg transition-[height] ${isFocused ? "h-0" : "h-48"}`} // set the height dynamically based on input focus to prevent the virtual keyboard from overlaying the input
      >
        <SeleneLogo className="h-full" cashtokens={hasTokens} />
      </div>
      <div className="p-1 bg-primary text-white shadow-inner">
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
          <div className="p-1 bg-zinc-500 rounded-t-sm">
            <span className="font-semibold text-zinc-200 flex items-center">
              {translate(translations.transactionId)}
              <CopyOutlined className="ml-1" />
            </span>
          </div>
          <div className="bg-zinc-200 p-1 rounded-b-sm">
            <span className="font-mono text-sm tracking-tighter break-all select-none">
              {tx.txid}
            </span>
          </div>
        </div>
        <div
          className="border rounded mb-2 border-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 bg-zinc-500 rounded-t-sm">
            <span className="font-semibold text-zinc-200">
              {translate(translations.memo)}
            </span>
          </div>
          <div className="bg-zinc-200 p-1 rounded-b-sm flex items-center">
            <input
              type="text"
              className="flex-1 rounded-sm p-1"
              value={memo}
              onChange={handleMemoChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {memo && (
              <CheckCircleFilled className="shrink text-primary text-lg ml-2 mr-1 font-bold" />
            )}
          </div>
        </div>
        <div
          className="bg-zinc-200 p-1 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-semibold pb-1 text-sm">
            {translate(translations.outputs)}
          </div>
          {tx.vout.map((output, i) => (
            <OutputListItem key={output.n} output={output} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendSuccess;

/* eslint-disable react/prop-types */
function OutputListItem({ output, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss} rounded-sm`}>
      <div className="flex text-sm items-center">
        <Address
          address={output.scriptPubKey.addresses[0]}
          className="tracking-tight"
        />
      </div>
      <div className="flex justify-between">
        <div>
          <span className="text-xs tracking-tighter mr-1.5 opacity-70">
            #{output.n}
          </span>
          <span className="font-mono">
            <Satoshi value={output.value} />
          </span>
          <span className="mx-1 text-zinc-500">/</span>
          <span className="text-sm opacity-80">
            <Satoshi value={output.value} flip />
          </span>
        </div>
        {output.token && (
          <div
            className="text-sm"
            style={{ color: `#${binToHex(output.token.category).slice(0, 6)}` }}
          >
            <TokenAmount token={output.token} />
          </div>
        )}
      </div>
    </div>
  );
}
