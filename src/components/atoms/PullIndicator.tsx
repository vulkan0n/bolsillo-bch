import { ChevronDown, Loader2 } from "lucide-react";

import { PULL_THRESHOLD } from "@/util/pullToRefresh";

interface PullIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
}

export default function PullIndicator({
  pullDistance,
  isRefreshing,
}: PullIndicatorProps) {
  if (isRefreshing) {
    return (
      <div className="flex justify-center items-center h-12 -mb-12 relative z-10">
        <Loader2
          data-testid="pull-spinner"
          className="w-6 h-6 text-brand-500 animate-spin"
        />
      </div>
    );
  }

  if (pullDistance <= 0) return null;

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 180;
  const isPastThreshold = progress >= 1;

  return (
    <div className="flex justify-center items-center h-12 -mb-12 relative z-10">
      <ChevronDown
        data-testid="pull-chevron"
        className={`w-6 h-6 transition-transform duration-150 ${
          isPastThreshold
            ? "text-brand-500"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
}
