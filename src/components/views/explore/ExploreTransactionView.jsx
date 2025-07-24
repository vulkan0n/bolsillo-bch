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
import Card from "@/atoms/Card";

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
        <div className="bg-neutral-700 rounded-sm">
          <div className="font-semibold text-neutral-100 p-1.5">
            {translate(translations.transactionId)}
          </div>
          <div
            className="flex items-center justify-center rounded-sm p-1 bg-primary-900"
            onClick={handleCopyTransactionId}
          >
            <div className="w-full p-2 bg-neutral-100 text-neutral-700 border-2 border-primary rounded-sm flex items-center justify-center active:bg-primary">
              <CopyOutlined className="mr-1" />
              <div className="font-mono text-xs flex flex-col items-center w-full">
                <span>{tx.txid.slice(0, 32)}</span>
                <span>{tx.txid.slice(32)}</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-neutral-200 text-white rounded-sm p-1 my-1">
          <div className="p-1">
            <div className="text-neutral-700 font-bold flex items-center justify-start">
              <span>{txDate}</span>
            </div>
            {isConfirmed ? (
              <div className="flex items-center font-bold text-neutral-500 text-sm">
                <span>
                  <span className="flex items-center">
                    <CheckCircleOutlined className="text-secondary mr-1" />{" "}
                    Confirmed in block #{tx.height} ({confirmations} blocks)
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center font-bold text-neutral-500 text-sm">
                <HourglassOutlined className="text-neutral-500 mr-1" /> Pending
                Confirmation
              </div>
            )}
          </div>
          <div
            className={`my-1 text-neutral-600 text-sm ${memo ? "" : "underline"}`}
          >
            <Editable
              value={memo}
              placeholder="Set Memo..."
              onConfirm={handleSaveMemo}
            />
          </div>
        </Card>

        <div className="mt-1.5">
          <div className="rounded mb-2" onClick={(e) => e.stopPropagation()}>
            <div className="p-1.5 bg-neutral-600 rounded-t">
              <span className="font-semibold text-neutral-25 flex items-center">
                {translate(translations.outputs)}
              </span>
            </div>
            <div className="bg-primary-700 border border-primary-900">
              {tx.vout.map((output, i) => (
                <OutputListItem key={output.n} output={output} i={i} />
              ))}
            </div>
          </div>
          <Accordion title={translate(translations.inputs)}>
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
  const zebraCss = i % 2 === 0 ? "bg-primary-100" : "bg-primary-50";

  const asmSplit = output.scriptPubKey.asm.split(" ");
  const isOpReturn = asmSplit[0] === "OP_RETURN";
  const opReturnData = hexToUtf8(asmSplit.slice(2)); // OP_RETURN OP_PUSHDATA_X ...

  return (
    <div className={`p-1.5 ${zebraCss}`}>
      <div className="flex text-sm items-center">
        {isOpReturn ? (
          <div className="font-mono font-bold text-neutral-700">OP_RETURN</div>
        ) : (
          <Address
            address={output.scriptPubKey.addresses[0]}
            className="tracking-tight"
          />
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
              <span className="mx-1 text-neutral-500">/</span>
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
  const zebraCss = i % 2 === 0 ? "bg-neutral-100" : "bg-neutral-50";

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
