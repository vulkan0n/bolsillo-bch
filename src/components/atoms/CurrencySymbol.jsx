import PropTypes from "prop-types";

import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";

import { currencyList } from "@/util/currency";

export default function CurrencySymbol({ currency, className }) {
  const { localCurrency, shouldPreferLocalCurrency } = useSelector(
    selectCurrencySettings
  );

  let findCurrency = currency;
  if (!findCurrency) {
    findCurrency = shouldPreferLocalCurrency ? localCurrency : "BCH";
  }

  const currencyObj =
    currencyList.find((c) => c.currency === findCurrency) || currencyList[0];
  const { symbol } = currencyObj;

  return <span className={className}>{symbol}</span>;
}

CurrencySymbol.propTypes = {
  currency: PropTypes.string,
  className: PropTypes.string,
};

CurrencySymbol.defaultProps = {
  currency: "",
  className: "",
};
