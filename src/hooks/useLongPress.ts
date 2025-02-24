import { useCallback, useEffect, useRef, useMemo } from "react";

export const useLongPress = (
  onLongPress = () => {},
  onClick = () => {},
  ms = 500
) => {
  const timerRef = useRef(setTimeout(() => {}, 0));
  const isLongPress = useRef(false);

  const start = useCallback(
    (event) => {
      isLongPress.current = false; // Reset on each start

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
    (event = undefined) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // do nothing on cleanup
      if (!event) {
        return;
      }

      // If it wasn't a long press, it's a click
      if (event && !isLongPress.current) {
        onClick(event);
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
