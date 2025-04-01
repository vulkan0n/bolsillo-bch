import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPreference, selectCurrencySettings } from "@/redux/preferences";

export function useCurrencyFlip() {
  const dispatch = useDispatch();

  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const handleFlipCurrency = useCallback(() => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );
  }, [dispatch, shouldPreferLocalCurrency]);

  return handleFlipCurrency;
}
