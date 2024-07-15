import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";
import { selectTransactionHistory, txHistoryFetch } from "@/redux/txHistory";
import { selectSyncState } from "@/redux/sync";
import translations from "./translations";
import { translate } from "@/util/translations";

import Button from "@/atoms/Button";
import Satoshi from "@/atoms/Satoshi";

function useTransactionHistory() {
  const dispatch = useDispatch();
  const txHistory = useSelector(selectTransactionHistory);

  useEffect(
    function loadTxHistory() {
      dispatch(txHistoryFetch());
    },
    [dispatch]
  );

  return txHistory;
}

export default function WalletViewHistory() {
  const navigate = useNavigate();

  const txHistory = useTransactionHistory();
  const sync = useSelector(selectSyncState);

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  return (
    <div className="p-2 pb-0">
      <div className="shadow-sm mb-2.5">
        <div className="bg-zinc-800 text-zinc-200 rounded-t-lg text-center text-lg p-1 font-semibold">
          {translate(translations.recentTransactions)}
        </div>
        <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-b px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
          {txHistory.length === 0 && (
            <li className="flex px-1 py-2 items-center justify-center tracking-tighter font-bold">
              {sync.syncPending.txHistory === 0 ? (
                <span>-----</span>
              ) : (
                <SyncOutlined className="text-3xl" spin />
              )}
            </li>
          )}
          {txHistory.map((tx, i) =>
            i < 100 ? (
              <li key={`${tx.txid}${tx.address}`} className="px-1 py-2">
                <Link to={`/explore/tx/${tx.txid}`}>
                  <div className="flex text-sm">
                    <div className="flex-1">
                      <div
                        className={`${
                          tx.amount > 0 ? receiveStyle : sendStyle
                        }`}
                      >
                        {(Number.isNaN(Number.parseInt(tx.time, 10))
                          ? DateTime.fromISO(tx.time_seen)
                          : DateTime.fromSeconds(Number.parseInt(tx.time, 10))
                        ).toLocaleString(DateTime.DATE_SHORT)}
                      </div>
                      <div className="opacity-80">
                        {(Number.isNaN(Number.parseInt(tx.time, 10))
                          ? DateTime.fromISO(tx.time_seen)
                          : DateTime.fromSeconds(Number.parseInt(tx.time, 10))
                        ).toLocaleString(DateTime.TIME_WITH_SECONDS)}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div
                        className={`font-mono ${
                          tx.amount > 0 ? receiveStyle : sendStyle
                        }`}
                      >
                        {tx.amount > 0 && "+"}
                        <Satoshi value={tx.amount} />
                      </div>
                      <div className="opacity-80">
                        <Satoshi value={tx.amount} flip />
                      </div>
                    </div>
                  </div>
                  {tx.memo && (
                    <div className="text-sm text-zinc-600/90">
                      Memo: {tx.memo}
                    </div>
                  )}
                </Link>
              </li>
            ) : null
          )}
        </ul>
      </div>
      <Button
        shittyFullWidthHack
        icon={BackIcon}
        onClick={() => navigate(-1)}
      />
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
