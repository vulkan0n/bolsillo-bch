import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface SlideToActionProps {
  onComplete: () => void | Promise<void>;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}

export default function SlideToAction({
  onComplete,
  label = "Deslizá para enviar",
  loadingLabel = "Enviando...",
  disabled = false,
}: SlideToActionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Reset progress when disabled changes (e.g. after error)
  useEffect(() => {
    if (!disabled && !isDragging) {
      setProgress(0);
    }
  }, [disabled, isDragging]);

  const getPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.min(Math.max(x / rect.width, 0), 1);
      return pct;
    },
    []
  );

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || isLoading || hasCompleted) return;
      setIsDragging(true);
      setProgress(getPosition(clientX));
    },
    [disabled, isLoading, hasCompleted, getPosition]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const pct = getPosition(clientX);
      setProgress(pct);
    },
    [isDragging, getPosition]
  );

  const handleEnd = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (progress >= 0.9) {
      setHasCompleted(true);
      setIsLoading(true);
      try {
        await onComplete();
      } finally {
        setIsLoading(false);
      }
    } else {
      setProgress(0);
    }
  }, [isDragging, progress, onComplete]);

  // -------- Touch events

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleStart(e.touches[0].clientX),
    [handleStart]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    [handleMove]
  );

  // -------- Mouse events (for desktop testing)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX);
      // Attach global listeners to track drag outside element
      const onMouseMove = (ev: globalThis.MouseEvent) =>
        handleMove(ev.clientX);
      const onMouseUp = () => {
        handleEnd();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [handleStart, handleMove, handleEnd]
  );

  // Touch end doesn't bubble reliably, attach to window
  useEffect(() => {
    const onTouchEnd = () => handleEnd();
    window.addEventListener("touchend", onTouchEnd);
    return () => window.removeEventListener("touchend", onTouchEnd);
  }, [handleEnd]);

  const thumbX = progress * 100;

  return (
    <div
      ref={trackRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onMouseDown={onMouseDown}
      className={`relative w-full h-14 rounded-xl select-none overflow-hidden
        ${disabled ? "opacity-50" : "cursor-pointer"}
        ${isLoading ? "bg-brand-600" : "bg-brand-500"}`}
    >
      {/* Label */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-white text-base font-semibold transition-opacity duration-150 ${
          progress > 0.15 ? "opacity-0" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {loadingLabel}
          </span>
        ) : (
          label
        )}
      </span>

      {/* Thumb */}
      <div
        className={`absolute top-1 left-1 w-12 h-12 rounded-full bg-white flex items-center justify-center
          shadow-md transition-shadow duration-150
          ${isDragging ? "" : "transition-transform duration-300 ease-out"}
          ${isLoading ? "bg-brand-100" : ""}`}
        style={{
          transform: `translateX(${thumbX > 94 ? 94 : thumbX}%)`,
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5 text-brand-600" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}
