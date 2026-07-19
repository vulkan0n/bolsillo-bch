import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

import { fetchExchangeRates } from "@/redux/exchangeRates";
import { selectIsStablecoinMode } from "@/redux/preferences";
import { syncHotRefresh } from "@/redux/sync";
import { txHistoryFetch } from "@/redux/txHistory";
import {
  selectActiveWallet,
  selectActiveWalletHash,
  selectGenesisHeight,
  selectPendingSwap,
  walletSyncDiff,
} from "@/redux/wallet";

import HomeHeader from "@/layout/HomeHeader";
import ActionButton from "@/atoms/ActionButton";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import PocketBalance from "@/atoms/PocketBalance";
import PullIndicator from "@/atoms/PullIndicator";

import { useFormattedBalance } from "@/hooks/useFormattedBalance";
import { useStableBalance } from "@/hooks/useStableBalance";

import {
  computePullDistance,
  MIN_DISPLAY_MS,
  PULL_THRESHOLD,
  SPINNER_REST,
} from "@/util/pullToRefresh";

import HomeRecentTransactions from "./HomeRecentTransactions";

export default function WalletViewHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const walletHash = useSelector(selectActiveWalletHash);
  const activeWallet = useSelector(selectActiveWallet);
  const genesisHeight = useSelector(selectGenesisHeight);
  const isStablecoinMode = useSelector(selectIsStablecoinMode);
  const pendingSwap = useSelector(selectPendingSwap);

  // -------- Balance display: stable or normal

  const { fiatAmount, fiatCurrency, bchAmount } = useFormattedBalance();
  const stableBalance = useStableBalance(walletHash);

  const pocketLabel = isStablecoinMode ? "MODO ESTABLE" : undefined;
  const pocketFiatAmount = isStablecoinMode
    ? stableBalance.totalFiatFormatted
    : fiatAmount;
  const pocketFiatSymbol = isStablecoinMode
    ? stableBalance.fiatSymbol
    : fiatCurrency;
  const pocketSubAmount = isStablecoinMode
    ? stableBalance.pusdAmount
    : bchAmount;
  const pocketSubLabel = isStablecoinMode ? "PUSD" : undefined;

  // ---------------- Pull-to-refresh state

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const touchStartY = useRef(0);
  const refreshStartTime = useRef(0);
  const pullDistanceRef = useRef(0);
  const isPullingRef = useRef(false);

  // ---------------- Capture <main> scroll container

  useLayoutEffect(() => {
    mainRef.current = document.querySelector("main");
  }, []);

  // ---------------- Refresh logic

  const handleRefresh = useCallback(async () => {
    refreshStartTime.current = Date.now();
    await Promise.allSettled([
      dispatch(syncHotRefresh({ force: true })),
      dispatch(txHistoryFetch()),
      dispatch(fetchExchangeRates(0)),
    ]);
    // Force Redux to re-read wallet balance from SQL.
    // syncComplete skips walletSyncDiff when isSyncComplete is true,
    // so we must dispatch it explicitly to keep Redux in sync.
    dispatch(
      walletSyncDiff({
        wallet: activeWallet,
        utxoDiff: { diffIn: [], diffOut: [] },
      })
    );
    const elapsed = Date.now() - refreshStartTime.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, remaining);
    });
    setIsRefreshing(false);
    setPullDistance(0);
  }, [dispatch, activeWallet]);

  // ---------------- Window-level touch handlers

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY <= 0) return;
      e.preventDefault();
      const distance = computePullDistance(deltaY);
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    };

    const onTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      setIsPulling(false);

      const distance = pullDistanceRef.current;
      if (distance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(SPINNER_REST);
        handleRefresh();
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isRefreshing, handleRefresh]);

  // ---------------- Touch start on wrapper

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;
      if (!mainRef.current || mainRef.current.scrollTop > 0) return;
      touchStartY.current = e.touches[0].clientY;
      isPullingRef.current = true;
      setIsPulling(true);
    },
    [isRefreshing]
  );

  // ---------------- Cleanup on unmount

  useEffect(() => {
    return () => {
      if (isRefreshing) {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    };
  }, [isRefreshing]);

  // ---------------- Render

  return (
    <div onTouchStart={onTouchStart}>
      <PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      <div
        className="bg-neutral-25 dark:bg-neutral-1000 pb-24 min-h-full"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        <HomeHeader />

        {genesisHeight > 0 && (
          <div className="px-5 mt-3">
            <KeyWarning walletHash={walletHash} />
          </div>
        )}

        {/* ---------- Degraded banner (stable mode + Cauldron down) ---------- */}
        {isStablecoinMode && pendingSwap && (
          <div className="px-5 mt-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                No se pudo estabilizar. Abrí la app de nuevo para reintentar.
              </p>
            </div>
          </div>
        )}

        <div className="px-5 mt-4">
          <div className="max-w-xs mx-auto">
            <PocketBalance
              fiatAmount={pocketFiatAmount}
              fiatCurrency={pocketFiatSymbol}
              bchAmount={pocketSubAmount}
              label={pocketLabel}
              subLabel={pocketSubLabel}
            />
          </div>
        </div>

        {isStablecoinMode && (
          <div className="px-5 mt-2">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
              Saldo unificado: PUSD + reserva BCH
            </p>
          </div>
        )}

        <div className="px-5 mt-8">
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <ActionButton
              icon={
                <ArrowDown
                  className="w-6 h-6 text-brand-700 dark:text-brand-200"
                  strokeWidth={1.75}
                />
              }
              label="Recibir"
              onClick={() => navigate("/wallet/receive")}
            />
            <ActionButton
              icon={
                <ArrowUp
                  className="w-6 h-6 text-brand-700 dark:text-brand-200"
                  strokeWidth={1.75}
                />
              }
              label="Enviar"
              onClick={() => navigate("/wallet/send/scan")}
            />
          </div>
        </div>

        <HomeRecentTransactions />
      </div>
    </div>
  );
}
