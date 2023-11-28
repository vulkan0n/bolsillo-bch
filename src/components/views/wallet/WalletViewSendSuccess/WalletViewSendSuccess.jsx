import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircleFilled } from "@ant-design/icons";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import TransactionHistoryService from "@/services/TransactionHistoryService";

import Address from "@/atoms/Address";
import { formatSatoshis } from "@/util/sats";

import { logos } from "@/util/logos";
import { translate } from "@/util/translations";
import translations from "./translations";

function WalletViewSendSuccess() {
  const location = useLocation();
  const { tx } = location.state;

  const wallet = useSelector(selectActiveWallet);

  const [memo, setMemo] = useState("");

  const handleMemoChange = (event) => setMemo(event.target.value);

  const handleMemoKeyDown = (event) => {
    if (event.key === "Enter") {
      TransactionHistoryService(wallet).setTransactionMemo(tx.txid, memo);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50">
      <Link to="/">
        <div className="flex items-center justify-center p-4 h-56 bg-zinc-800">
          <img src={logos.selene.img} className="h-full" alt="" />
        </div>
        <div className="p-4 bg-primary text-white border-b shadow">
          <div className="p-2 flex justify-center items-center">
            <span className="text-4xl font-bold">
              {translate(translations.transactionSent)}
            </span>
          </div>
          <div className="p-2 flex justify-center items-center">
            <span className="text-2xl font-semibold">
              {translate(translations.tapAnywhereToContinue)}
            </span>
          </div>
        </div>
      </Link>
      <Link to={`/explore/tx/${tx.txid}`}>
        <div className="bg-zinc-200 mb-1 border-b border-zinc-500">
          <span className="mr-1 font-semibold">Transaction ID:</span>
          <span className="font-mono text-sm tracking-tighter break-all select-all">
            {tx.txid}
          </span>
        </div>
      </Link>
      <div className="p-2">
        <div className="bg-zinc-200 p-1 rounded mb-2 flex">
          <span className="font-semibold p-0.5">Memo</span>
          <input
            type="text"
            className="ml-1 flex-1 rounded-sm"
            value={memo}
            onChange={handleMemoChange}
            onKeyDown={handleMemoKeyDown}
          />
        </div>
        <div className="bg-zinc-200 p-1 rounded">
          <div className="font-semibold py-1">Outputs</div>
          {tx.vout.map((output, i) => (
            <OutputListItem key={output.n} output={output} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendSuccess;

function OutputListItem({ output, i }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss} rounded-sm`}>
      <div className="flex text-sm items-center">
        <div>
          <Address address={output.scriptPubKey.addresses[0]} />
        </div>
      </div>
      <div className="">
        <span className="text-xs tracking-tighter mr-1.5 opacity-70">
          #{output.n}
        </span>
        <span className="font-mono">{formatSatoshis(output.value)["bch"]}</span>
        <span className="mx-1 text-zinc-500">/</span>
        <span className="text-sm opacity-80">
          {formatSatoshis(output.value)["fiat"]}
        </span>
      </div>
    </div>
  );
}
