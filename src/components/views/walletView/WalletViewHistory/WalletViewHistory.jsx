import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { selectLocale } from "@/redux/device";
import { selectCurrencySettings } from "@/redux/preferences";
import { formatSatoshis } from "@/util/sats";
import { selectTransactionHistory } from "@/redux/transactions";

import translations from "./translations";
import { translate } from "@/util/translations";

import Button from "@/components/atoms/Button";

export default function WalletViewHistory() {
  const navigate = useNavigate();
  const locale = useSelector(selectLocale);
  const transactions = useSelector(selectTransactionHistory);
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  return (
    <div className="p-2 pb-0">
      <div className="shadow-sm mb-2.5">
        <div className="bg-zinc-800 text-zinc-200 rounded-t-lg text-center text-lg p-1 font-semibold">
          {translate(translations.recentTransactions)}
        </div>
        <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-b px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
          {transactions.map((tx, i) =>
            i < 100 ? (
              <li key={tx.txid} className="flex px-1 py-2">
                <div
                  type="div"
                  className="flex-1 text-sm"
                  onClick={
                    () => null /*console.log(tx.time, new Date(tx.time))*/
                  }
                >
                  <div
                    className={`${tx.amount > 0 ? receiveStyle : sendStyle}`}
                  >
                    {new Date(tx.time).toLocaleDateString(locale)}
                  </div>
                  <div className="text-sm opacity-80">
                    {new Date(tx.time).toLocaleTimeString(locale)}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div
                    className={`font-mono ${
                      tx.amount > 0 ? receiveStyle : sendStyle
                    }`}
                  >
                    {tx.amount > 0 && "+"}
                    {
                      formatSatoshis(tx.amount)[
                        shouldPreferLocalCurrency ? "fiat" : "bch"
                      ]
                    }
                  </div>
                  <div className="text-sm opacity-80">
                    {
                      formatSatoshis(tx.amount)[
                        shouldPreferLocalCurrency ? "bch" : "fiat"
                      ]
                    }
                  </div>
                </div>
              </li>
            ) : null
          )}
        </ul>
      </div>
      <Button icon={BackIcon} onClick={() => navigate(-1)} />
    </div>
  );
}

function BackIcon() {
  return (
    <>
      <ArrowLeftOutlined className="mr-1" />
      {translate(translations.back)}
    </>
  );
}
