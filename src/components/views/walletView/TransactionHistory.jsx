import { useSelector } from "react-redux";
import { selectTransactionHistory } from "@/redux/transactions";

function TransactionHistory() {
  const transactions = useSelector(selectTransactionHistory);

  return (
      <ul className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300 rounded-lg p-2">
        {transactions.map((tx) => (
          <li key={tx.txid} className="flex p-1">
            <div className="flex-1">{tx.time}</div>
            <div className="flex-1 text-error text-right">{tx.amount}</div>
          </li>
        ))}
      </ul>
  );
}

export default TransactionHistory;
