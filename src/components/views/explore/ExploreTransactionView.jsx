import { useLoaderData } from "react-router-dom";
//import {} from "@ant-design/icons";

import TransactionManagerService from "@/services/TransactionManagerService";

export default function ExploreTransactionView() {
  const tx = useLoaderData();

  return (
    <div className="p-2">
      <div className="bg-zinc-100">
        <div className="text-lg font-semibold">Transaction Hash</div>
        <div className="break-all font-mono">{tx.txid}</div>
      </div>
      <div className="bg-zinc-100 rounded font-mono">
        <ul>
          {Object.keys(tx).map((key) => (
            <li>
              <span className="font-bold">{key}:</span>{" "}
              {JSON.stringify(tx[key])}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
