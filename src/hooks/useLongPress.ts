import { useCallback, useEffect, useRef, useMemo } from "react";

export const useLongPress = <T>(
  onLongPress: (e?: T) => void = () => {},
  onClick: (e?: T) => void = () => {},
  ms = 500
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(setTimeout(() => {}, 0));
  const isLongPress = useRef<boolean>(false);

  const start = useCallback(
    (event) => {
      isLongPress.current = false;
      if (event) {
        event.stopPropagation();
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

      // If it was a long press, suppress the pointerup
      if (isLongPress.current) {
        (event as PointerEvent).preventDefault?.();
        return;
      }

      onClick(event);
    },
    [onClick]
  );

  const preventContextMenu = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  const events = useMemo(
    () => ({
      onPointerDown: start,
      onPointerUp: clear,
      onContextMenu: preventContextMenu,
    }),
    [start, clear, preventContextMenu]
  );

  return events;
};
