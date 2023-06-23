import { useSelector, useDispatch } from "react-redux";
import { selectLocalCurrency } from "@/redux/preferences";

import { currencyList } from "@/util/currency";

export default function CurrencySymbol({ currency, className }) {
  const { localCurrency, preferLocalCurrency } =
    useSelector(selectLocalCurrency);

  let findCurrency = currency;
  if (!findCurrency) {
    findCurrency = preferLocalCurrency ? localCurrency : "BCH";
  }

  const currencyObj =
    currencyList.find((c) => c.currency === findCurrency) || currencyList[0];
  const symbol = currencyObj.symbol;

  return <span className={className}>{symbol}</span>;
}
