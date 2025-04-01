import { useSelector } from "react-redux";
import { selectLocale } from "@/redux/device";

export default function NumberFormat({
  number = 0,
  decimals = 0,
}: {
  number: number;
  decimals: number;
}) {
  const locale = useSelector(selectLocale);

  const numberFormat =
    decimals > 0
      ? new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
        }).format(number)
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: decimals,
        }).format(number);

  return <span>{numberFormat}</span>;
}
