import { useSelector } from "react-redux";
import { selectLocale } from "@/redux/device";
import { selectPreferences } from "@/redux/preferences";
import { satsToBch, formatSatoshis } from "@/util/sats";
import { selectTransactionHistory } from "@/redux/transactions";
import CurrencyService from "@/services/CurrencyService";

function TransactionHistory() {
  const locale = useSelector(selectLocale);
  const preferences = useSelector(selectPreferences);
  const transactions = useSelector(selectTransactionHistory);

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  const localCurrency = preferences["localCurrency"];
  const preferLocal = preferences["preferLocalCurrency"] === "true";
  const denominateSats = preferences["denominateSats"] === "true";
  const unit = denominateSats ? "sats" : "BCH";
  const Currency = new CurrencyService(localCurrency);

  return (
    <>
      <div className="bg-zinc-700 text-zinc-200 rounded-t-lg text-center text-lg p-1 font-semibold drop-shadow">
        Recent Transactions
      </div>
      <ul className="bg-zinc-200 text-zinc-600 divide-y divide-zinc-300 rounded-b-lg px-2 h-[70vh] overflow-y-scroll">
        {transactions.map((tx, i) =>
          i < 50 ? (
            <li key={tx.txid} className="flex px-1 py-2">
              <div className="flex-1 text-sm">{tx.time}</div>
              <div className="flex-1 text-right">
                <div
                  className={`font-mono ${
                    tx.amount > 0 ? receiveStyle : sendStyle
                  }`}
                >
                  {tx.amount > 0 && "+"}
                  {formatSatoshis(tx.amount)[preferLocal ? "fiat" : "bch"]}
                </div>
                <div className="text-sm opacity-80">
                  {formatSatoshis(tx.amount)[preferLocal ? "bch" : "fiat"]}
                </div>
              </div>
            </li>
          ) : null
        )}
      </ul>
    </>
  );
}

export default TransactionHistory;
