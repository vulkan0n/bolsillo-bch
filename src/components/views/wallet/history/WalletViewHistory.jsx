import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import {
  SyncOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { selectTransactionHistory, txHistoryFetch } from "@/redux/txHistory";
import { selectSyncState } from "@/redux/sync";
import { selectPrivacySettings } from "@/redux/preferences";
import translations from "@/views/wallet/translations";
import { translate } from "@/util/translations";

import ViewHeader from "@/layout/ViewHeader";
import Satoshi from "@/atoms/Satoshi";
import TokenAmount from "@/atoms/TokenAmount";

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
  const txHistory = useTransactionHistory();
  const { syncPending } = useSelector(selectSyncState);

  const { shouldHideBalance } = useSelector(selectPrivacySettings);

  const historyRender = useMemo(() => {
    const receiveStyle = "text-success";
    const sendStyle = "text-error";

    const zebraCss = [
      {
        true: "bg-primary-50 dark:bg-primarydark-50 text-neutral-800 dark:text-neutral-200",
        false:
          "bg-neutral-25 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200",
      },
      {
        true: "bg-primary-100 dark:bg-primarydark-100 text-neutral-800 dark:text-neutral-200",
        false:
          "bg-neutral-50 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200",
      },
    ];

    return txHistory.map((tx, i) =>
      i < 100 ? (
        <li
          key={`${tx.txid}${tx.address}:${tx.block_pos}`}
          className={`p-2 ${zebraCss[i % 2][tx.amount > 0]}`}
        >
          <Link to={`/explore/tx/${tx.txid}`}>
            <div className="flex text-sm">
              <div className="shrink flex flex-col items-center justify-center mr-1 text-xs">
                {tx.height <= 0 ? (
                  <HourglassOutlined className="text-neutral-400" />
                ) : (
                  <CheckCircleOutlined className="text-primary-700" />
                )}
              </div>
              <div className="flex-1">
                <div className={`${tx.amount > 0 ? receiveStyle : sendStyle}`}>
                  {(tx.height <= 0 || !tx.time
                    ? DateTime.fromISO(tx.time_seen)
                    : DateTime.fromSeconds(tx.time)
                  ).toLocaleString(DateTime.DATE_SHORT)}
                </div>
                <div>
                  {(tx.height <= 0 || !tx.time
                    ? DateTime.fromISO(tx.time_seen)
                    : DateTime.fromSeconds(tx.time)
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
                <div>
                  <Satoshi value={tx.amount} flip />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              {tx.memo && (
                <div className="grow text-sm text-neutral-500 mx-4">
                  {tx.memo}
                </div>
              )}
              {tx.tokens && !shouldHideBalance ? (
                <div className="flex flex-1 justify-end flex-wrap gap-x-2 mr-0.5">
                  {tx.tokens.map((token) => (
                    <div className="flex justify-end items-center text-right text-sm">
                      <span
                        style={{
                          color: `#${token.category?.slice(0, 6)}`,
                        }}
                        className="font-mono text-xs tracking-tighter font-bold"
                      >
                        {token.symbol}
                      </span>
                      {token.nft_amount !== 0 && (
                        <TokenAmount token={token} nft />
                      )}
                      {token.fungible_amount !== 0 && (
                        <TokenAmount token={token} />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        </li>
      ) : null
    );
  }, [txHistory, shouldHideBalance]);

  return (
    <div className="flex flex-col justify-start h-full">
      <ViewHeader
        icon={HistoryOutlined}
        title={translate(translations.recentTransactions)}
        small
      />
      <div className="h-full pb-2">
        <ul className="text-neutral-500 divide-y divide-neutral-300 dark:divide-neutral-700 rounded-b-sm overflow-y-scroll shadow-inner h-full">
          {txHistory.length === 0 && (
            <li className="flex px-1 py-2 items-center justify-center tracking-tighter font-bold">
              {syncPending.txHistory === 0 ? (
                <span>-----</span>
              ) : (
                <SyncOutlined className="text-3xl" spin />
              )}
            </li>
          )}
          {historyRender}
        </ul>
      </div>
    </div>
  );
}
