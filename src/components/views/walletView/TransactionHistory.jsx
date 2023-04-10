function TransactionHistory() {
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
          <td>A few seconds ago</td>
          <td>qzyw7-mm6d</td>
          <td className="text-error">-1.45163248</td>
        </tr>
        <tr>
          <td>5 minutes ago</td>
          <td>You</td>
          <td className="text-secondary">+0.30153702</td>
        </tr>
        <tr>
          <td>12 minutes ago</td>
          <td>You</td>
          <td className="text-secondary">+5.01431754</td>
        </tr>
        <tr>
          <td>15:42</td>
          <td>qzx5d-5hp9</td>
          <td className="text-error">-0.00133703</td>
        </tr>
        <tr>
          <td>Yesterday</td>
          <td>qq354-9etp</td>
          <td className="text-error">-0.42051791</td>
        </tr>
        <tr>
          <td>2023-02-14</td>
          <td>You</td>
          <td className="text-secondary">+0.97143219</td>
        </tr>
        <tr>
          <td>2023-02-13</td>
          <td>qqpkak-zuk5</td>
          <td className="text-error">-0.74647216</td>
        </tr>
        <tr>
          <td>2023-02-12</td>
          <td>You</td>
          <td className="text-secondary">+3.74825931</td>
        </tr>
        <tr>
          <td>2023-02-12</td>
          <td>qzx5d-5hp9</td>
          <td className="text-error">-0.00133703</td>
        </tr>
        <tr>
          <td>2023-02-11</td>
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
