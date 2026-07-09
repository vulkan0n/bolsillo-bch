import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface SlideToActionProps {
  onComplete: () => void | Promise<void>;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}

const THUMB_SIZE = 48; // w-12
const PADDING = 4; // top-1 left-1

export default function SlideToAction({
  onComplete,
  label = "Deslizá para enviar",
  loadingLabel = "Enviando...",
  disabled = false,
}: SlideToActionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const progressRef = useRef(0);
  const hasCompleted = useRef(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure track width on mount and resize
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => setTrackWidth(el.clientWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset when disabled
  useEffect(() => {
    if (disabled) {
      setDisplayProgress(0);
      progressRef.current = 0;
    }
  }, [disabled]);

  // Max pixels the thumb can travel
  const maxTravel = trackWidth - THUMB_SIZE - PADDING * 2;

  const getProgress = useCallback(
    (clientX: number) => {
      if (!trackRef.current || maxTravel <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left - PADDING;
      return Math.min(Math.max(x / maxTravel, 0), 1);
    },
    [maxTravel]
  );

  // -------- End drag

  const handleEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const pct = progressRef.current;

    if (pct >= 0.9) {
      hasCompleted.current = true;
      setIsLoading(true);
      try {
        await onComplete();
      } finally {
        setIsLoading(false);
      }
    } else {
      setDisplayProgress(0);
      progressRef.current = 0;
    }
  }, [onComplete]);

  // -------- Window-level touch handlers

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const pct = getProgress(e.touches[0].clientX);
      progressRef.current = pct;
      setDisplayProgress(pct);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleEnd, getProgress]);

  // -------- Touch start

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || isLoading || hasCompleted.current) return;
      isDragging.current = true;
      const pct = getProgress(clientX);
      progressRef.current = pct;
      setDisplayProgress(pct);
    },
    [disabled, isLoading, getProgress]
  );

  // -------- Mouse

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isLoading || hasCompleted.current) return;
      isDragging.current = true;
      const pct = getProgress(e.clientX);
      progressRef.current = pct;
      setDisplayProgress(pct);

      const onMouseMove = (ev: globalThis.MouseEvent) => {
        if (!isDragging.current) return;
        const p = getProgress(ev.clientX);
        progressRef.current = p;
        setDisplayProgress(p);
      };
      const onMouseUp = () => {
        handleEnd();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [disabled, isLoading, getProgress, handleEnd]
  );

  const thumbLeft = PADDING + displayProgress * maxTravel;

  return (
    <div
      ref={trackRef}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onMouseDown={onMouseDown}
      className={`relative w-full h-14 rounded-xl select-none overflow-hidden
        ${disabled || isLoading ? "opacity-50" : "cursor-pointer"}
        ${isLoading ? "bg-brand-600" : "bg-brand-500"}`}
    >
      {/* Label */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-white text-base font-semibold transition-opacity duration-150 ${
          displayProgress > 0.18 ? "opacity-0" : "opacity-100"
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

      {/* Thumb — uses pixel-based left for 1:1 finger tracking */}
      <div
        className={`absolute top-1 w-12 h-12 rounded-full bg-white flex items-center justify-center
          shadow-md
          ${
            isDragging.current ? "" : "transition-[left] duration-300 ease-out"
          }`}
        style={{
          left: `${thumbLeft}px`,
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
