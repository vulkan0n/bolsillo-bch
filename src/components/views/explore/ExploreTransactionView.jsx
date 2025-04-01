/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import { useSelector } from "react-redux";
import { DateTime } from "luxon";
import {
  CopyOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWalletHash } from "@/redux/wallet";
import { selectChaintip } from "@/redux/sync";

import TransactionHistoryService from "@/services/TransactionHistoryService";
import TransactionManagerService from "@/services/TransactionManagerService";
//import LogService from "@/services/LogService";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import Accordion from "@/atoms/Accordion";
import Editable from "@/atoms/Editable";
import TokenAmount from "@/atoms/TokenAmount";

import ExploreSearchBar from "./ExploreSearchBar";

import { useClipboard } from "@/hooks/useClipboard";

import { hexToUtf8, binToHex } from "@/util/hex";

import { translate } from "@/util/translations";
import translations from "./translations";

//const Log = LogService("ExploreTransactionView");

export default function ExploreTransactionView() {
  const tx = useLoaderData();

  const walletHash = useSelector(selectActiveWalletHash);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const chaintip = useSelector(selectChaintip);

  const [memo, setMemo] = useState(
    TransactionHistoryService(walletHash, localCurrency).getTransactionMemo(
      tx.txid
    ) || ""
  );

  const isConfirmed = tx.blockhash !== null;
  const confirmations = isConfirmed ? chaintip.height - tx.height : 0;

  const txDate = (
    isConfirmed ? DateTime.fromSeconds(tx.time) : DateTime.fromISO(tx.time_seen)
  ).toLocaleString(DateTime.DATETIME_FULL);

  const { handleCopyToClipboard } = useClipboard();
  const handleCopyTransactionId = async () => {
    handleCopyToClipboard(tx.txid, translate(translations.transactionId));
  };

  const handleSaveMemo = (value) => {
    setMemo(value);
    TransactionHistoryService(walletHash, localCurrency).setTransactionMemo(
      tx.txid,
      value
    );
  };

  //Log.debug(tx, confirmations);

  return (
    <>
      <ExploreSearchBar />
      <div className="p-1">
        <div className="bg-zinc-700 rounded p-2">
          <div className="text-center font-semibold text-white mb-1">
            {translate(translations.transactionId)}
          </div>
          <div
            className="flex items-center justify-center rounded"
            onClick={handleCopyTransactionId}
          >
            <div className="w-full p-2 bg-zinc-100 text-zinc-700 border border-primary rounded flex items-center justify-center active:bg-primary">
              <CopyOutlined className="mr-1" />
              <div className="font-mono text-xs flex flex-col items-center w-full">
                <span>{tx.txid.slice(0, 32)}</span>
                <span>{tx.txid.slice(32)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-200 text-white rounded p-1 my-1">
          <div className="p-1">
            <div className="text-zinc-700 font-bold flex items-center justify-start">
              <span>{txDate}</span>
            </div>
            {isConfirmed ? (
              <div className="flex items-center font-bold text-zinc-500 text-sm">
                <span>
                  <span className="flex items-center">
                    <CheckCircleOutlined className="text-secondary mr-1" />{" "}
                    Confirmed in block #{tx.height} ({confirmations} blocks)
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center font-bold text-zinc-500 text-sm">
                <HourglassOutlined className="text-zinc-500 mr-1" /> Pending
                Confirmation
              </div>
            )}
          </div>
          <div
            className={`my-1 text-zinc-600 text-sm ${memo ? "" : "underline"}`}
          >
            <Editable
              value={memo}
              placeholder="Set Memo..."
              onConfirm={handleSaveMemo}
            />
          </div>
        </div>
        <div className="mt-1.5">
          <div className="bg-zinc-600 p-1 rounded">
            <div className="font-semibold pb-1 text-zinc-100">Outputs</div>
            {tx.vout.map((output, i) => (
              <OutputListItem key={output.n} output={output} i={i} />
            ))}
          </div>
          <Accordion title="Inputs">
            {tx.vin.map((input, i) => (
              <InputListItem
                key={`${input.txid}:${input.vout}`}
                input={input}
                i={i}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}

function OutputListItem({ output, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  const asmSplit = output.scriptPubKey.asm.split(" ");
  const isOpReturn = asmSplit[0] === "OP_RETURN";
  const opReturnData = hexToUtf8(asmSplit.slice(2)); // OP_RETURN OP_PUSHDATA_X ...

  return (
    <div className={`p-1.5 ${zebraCss} rounded-sm`}>
      <div className="flex text-sm items-center">
        {isOpReturn ? (
          <div className="font-mono font-bold text-zinc-700">OP_RETURN</div>
        ) : (
          <Address address={output.scriptPubKey.addresses[0]} />
        )}
      </div>
      <div className="flex justify-between">
        <div>
          <span className="text-xs tracking-tighter mr-1.5 opacity-70">
            #{output.n}
          </span>
          {isOpReturn ? (
            <span className="font-mono">{opReturnData}</span>
          ) : (
            <span>
              <span className="font-mono">
                <Satoshi value={output.value} />
              </span>
              <span className="mx-1 text-zinc-500">/</span>
              <span className="text-sm opacity-80">
                <Satoshi value={output.value} flip />
              </span>
            </span>
          )}
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

function InputListItem({ input, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  const [inputTx, setInputTx] = useState(null);

  useEffect(
    function resolveInput() {
      const resolve = async () => {
        const resolvedTx = await TransactionManagerService().resolveTransaction(
          input.txid
        );
        setInputTx(resolvedTx);
      };
      resolve();
    },
    [input.txid]
  );

  const ResolvedInput = useCallback(() => {
    if (inputTx === null) {
      return (
        <div className={`p-1.5 ${zebraCss} truncate tracking-tight`}>
          <Link className="font-mono text-xs" to={`/explore/tx/${input.txid}`}>
            {input.txid}:{input.vout}
          </Link>
        </div>
      );
    }

    const output = inputTx.vout.find((out) => out.n === input.vout);

    return (
      <Link to={`/explore/tx/${input.txid}`}>
        <OutputListItem output={output} i={i} />
      </Link>
    );
  }, [inputTx, input.txid, zebraCss, i, input.vout]);

  return <ResolvedInput />;
}
