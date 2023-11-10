import { useLoaderData } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";
//import {} from "@ant-design/icons";

import Address from "@/atoms/Address";
import { formatSatoshis } from "@/util/sats";

export default function ExploreTransactionView() {
  const tx = useLoaderData();
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const isConfirmed = tx.blocktime !== "null";
  const txDate = (
    isConfirmed ? new Date(tx.blocktime) : Date.parse(tx.time_seen)
  ).toLocaleString();

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

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
          <ul>
            {tx.vout.map((output) => (
              <li>
                <div className="flex">
                  <div>#{output.n}</div>
                  <div className="text-sm tracking-tighter">
                    <Address address={output.scriptPubKey.addresses[0]} short />
                  </div>
                  <div className="flex-1 text-right">
                    <div
                      className={`font-mono ${
                        output.value > 0 ? receiveStyle : sendStyle
                      }`}
                    >
                      {output.value > 0 && "+"}
                      {
                        formatSatoshis(output.value)[
                          shouldPreferLocalCurrency ? "fiat" : "bch"
                        ]
                      }
                    </div>
                    <div className="text-sm opacity-80">
                      {
                        formatSatoshis(output.value)[
                          shouldPreferLocalCurrency ? "bch" : "fiat"
                        ]
                      }
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div>Inputs</div>
          <ul>
            {tx.vin.map((input) => (
              <li>{JSON.stringify(input)}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
