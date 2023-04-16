import { useSelector } from "react-redux";
import { selectTransactionHistory } from "@/redux/transactions";

function TransactionHistory() {
  const transactions = useSelector(selectTransactionHistory);

  return (
    <table className="table table-compact w-full h-full rounded-xl bg-zinc-800 text-zinc-200">
      <thead>
        <tr>
          <th>Time</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300">
        {transactions.map((tx) => (
          <tr key={tx.txid}>
            <td>{new Date(tx.time * 1000).toDateString()}</td>
            <td className="text-error text-right">-1.45163248</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>Prev</th>
          <th>Next</th>
        </tr>
      </tfoot>
    </table>
  );
}

export default TransactionHistory;
