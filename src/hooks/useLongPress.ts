import { useCallback, useEffect, useRef, useMemo } from "react";

export const useLongPress = <T>(
  onLongPress: (e: T) => void = () => {},
  onClick: (e: T) => void = () => {},
  ms = 500
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(setTimeout(() => {}, 0));
  const isLongPress = useRef<boolean>(false);
  const hasClicked = useRef<boolean>(false);

  const start = useCallback(
    (event?: T) => {
      isLongPress.current = false; // Reset on each start
      hasClicked.current = false;
      if (event) {
        timerRef.current = setTimeout(() => {
          isLongPress.current = true;
          onLongPress(event);
        }, ms);
      }
    },
    [onLongPress, ms]
  );

  const clear = useCallback(
    (event?: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // do nothing on cleanup
      if (!event) {
        return;
      }

      // If it wasn't a long press, it's a click
      if (event && !isLongPress.current && !hasClicked.current) {
        onClick(event);
        hasClicked.current = true;
      }
    },
    [onClick]
  );

  useEffect(() => {
    // Cleanup on unmount
    return () => clear();
  }, [clear]);

  const events = useMemo(
    () => ({
      onMouseDown: start,
      onTouchStart: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onTouchEnd: clear,
    }),
    [start, clear]
  );

  return events;
};
