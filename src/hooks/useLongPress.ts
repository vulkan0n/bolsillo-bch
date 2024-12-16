import { useCallback, useEffect, useRef } from "react";

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
    (event) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // If it wasn't a long press, it's a click
      if (event && !isLongPress.current) {
        onClick(event);
      }
    },
    [onClick]
  );

  useEffect(() => {
    return () => clear(); // Cleanup on unmount or when dependencies change
  }, [clear]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
};
