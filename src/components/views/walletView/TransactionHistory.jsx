import { useSelector } from "react-redux";
import { selectTransactionHistory } from "@/redux/transactions";

function TransactionHistory() {
  const transactions = useSelector(selectTransactionHistory);
  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  return (
    <ul className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300 rounded-lg p-2">
      {transactions.map((tx) => (
        <li key={tx.txid} className="flex p-1">
          <div className="flex-1">{tx.time}</div>
          <div
            className={`flex-1 text-right ${
              tx.amount > 0 ? receiveStyle : sendStyle
            }`}
          >
            {tx.amount > 0 && "+"}{tx.amount}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TransactionHistory;
