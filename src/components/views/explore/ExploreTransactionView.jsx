import Logger from "js-logger";
import { useLoaderData, Link } from "react-router-dom";
import { useSelector } from "react-redux";
//import {} from "@ant-design/icons";
import { selectCurrencySettings } from "@/redux/preferences";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";

export default function ExploreTransactionView() {
  const tx = useLoaderData();

  const isConfirmed = tx.blocktime !== "null";
  const txDate = (
    isConfirmed ? new Date(tx.blocktime * 1000) : Date.parse(tx.time_seen)
  ).toLocaleString();

  Logger.debug(tx);

  return (
    <>
      <div className="p-2 bg-zinc-100 border-b border-zinc-400">
        <span className="text-lg font-semibold mr-1">Transaction ID:</span>
        <span className="break-all font-mono text-sm">{tx.txid}</span>
      </div>
      <div className="text-zinc-800 p-1 font-bold">
        {isConfirmed ? "Confirmed" : "Seen"} {txDate}
      </div>
      <div className="p-1">
        <div className="bg-zinc-200 rounded p-1">
          <div className="font-semibold py-1">Outputs</div>
          {tx.vout.map((output, i) => (
            <OutputListItem key={output.n} output={output} i={i} />
          ))}
        </div>
        <div className="bg-zinc-200 rounded p-1 mt-2">
          <div className="font-semibold py-1">Inputs</div>
          {tx.vin.map((input, i) => (
            <InputListItem
              key={`${input.txid}:${input.vout}`}
              input={input}
              i={i}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function OutputListItem({ output, i }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss}`}>
      <div className="flex text-sm items-center">
        <div>
          <Address address={output.scriptPubKey.addresses[0]} />
        </div>
      </div>
      <div className="">
        <span className="text-xs tracking-tighter mr-1.5 opacity-70">
          #{output.n}
        </span>
        <span className="font-mono">
          <Satoshi value={output.value} fiat={shouldPreferLocalCurrency} />
        </span>
        <span className="mx-1 text-zinc-500">/</span>
        <span className="text-sm opacity-80">
          <Satoshi value={output.value} fiat={!shouldPreferLocalCurrency} />
        </span>
      </div>
    </div>
  );
}

function InputListItem({ input, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss} truncate tracking-tight`}>
      <Link className="font-mono text-xs" to={`/explore/tx/${input.txid}`}>
        {input.txid}:{input.vout}
      </Link>
    </div>
  );
}
