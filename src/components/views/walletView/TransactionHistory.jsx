import { Link } from "react-router-dom";

function TransactionHistory() {
  const transaction = {
    txid: "d3adb33f"
  };

  const address = "bitcoincash:qzyw7yz3mpwlujpd3e7f9llw9kk37l53vqrn77mm6d";

  return (
    <table className="table table-compact w-full h-full rounded-xl bg-zinc-800 text-zinc-200">
      <thead>
        <tr>
          <th>Time</th>
          <th>To</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300">
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>A few seconds ago</Link></td>
          <td><Link to={`/wallet/send/${address}`}>qzyw7-mm6d</Link></td>
          <td className="text-error">-1.45163248</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>5 minutes ago</Link></td>
          <td>You</td>
          <td className="text-secondary">+0.30153702</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>12 minutes ago</Link></td>
          <td>You</td>
          <td className="text-secondary">+5.01431754</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>15:42</Link></td>
          <td><Link to={`/wallet/send/${address}`}>qzx5d-5hp9</Link></td>
          <td className="text-error">-0.00133703</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>Yesterday</Link></td>
        <td><Link to={`/wallet/send/${address}`}>qq354-9etp</Link></td>
        <td className="text-error">-0.42051791</td>
      </tr>
      <tr>
        <td><Link to={`/transaction/${transaction.txid}`}>2023-02-14</Link></td>
        <td>You</td>
        <td className="text-secondary">+0.97143219</td>
      </tr>
      <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>2023-02-13</Link></td>
          <td><Link to={`/wallet/send/${address}`}>qqpkak-zuk5</Link></td>
          <td className="text-error">-0.74647216</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>2023-02-12</Link></td>
          <td>You</td>
          <td className="text-secondary">+3.74825931</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>2023-02-12</Link></td>
          <td><Link to={`/wallet/send/${address}`}>qzx5d-5hp9</Link></td>
          <td className="text-error">-0.00133703</td>
        </tr>
        <tr>
          <td><Link to={`/transaction/${transaction.txid}`}>2023-02-11</Link></td>
          <td>You</td>
          <td className="text-secondary">+999.74825931</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Prev</th>
          <th>Search</th>
          <th>Next</th>
        </tr>
      </tfoot>
    </table>
  );
}

export default TransactionHistory;
