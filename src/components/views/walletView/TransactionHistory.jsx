import { useSelector } from "react-redux";
import { selectPreferences } from "@/redux/preferences";
import { selectTransactionHistory } from "@/redux/transactions";
import { formatSatoshis } from "@/util/sats";

function TransactionHistory() {
  const preferences = useSelector(selectPreferences);
  const transactions = useSelector(selectTransactionHistory);

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  return (
    <>
      <div className="bg-zinc-700 text-zinc-200 rounded-t-lg text-center text-lg p-1 font-semibold">
        Recent Transactions
      </div>
      <ul className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300 rounded-b-lg px-2">
        {transactions.map((tx, i) =>
          i < 10 ? (
            <li key={tx.txid} className="flex px-1 py-2">
              <div className="flex-1 text-sm">{tx.time}</div>
              <div className="flex-1 text-right">
                <div
                  className={`font-mono ${
                    tx.amount > 0 ? receiveStyle : sendStyle
                  }`}
                >
                  {tx.amount > 0 && "+"}
                  {formatSatoshis(tx.amount)}
                </div>
                <div className="text-sm opacity-80">$0.00 {preferences["localCurrency"]}</div>
              </div>
            </li>
          ) : null
        )}
      </ul>
    </>
  );
}

export default TransactionHistory;
