import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";

import { formatSatoshis } from "@/util/sats";

export default function Satoshi({ value, fiat }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const shouldDisplayFiat =
    fiat || (shouldPreferLocalCurrency && fiat === undefined);

  const formatIndex = shouldDisplayFiat ? "fiat" : "bch";

  return <span>{formatSatoshis(value)[formatIndex]}</span>;
}

Satoshi.propTypes = {
  value: PropTypes.number.isRequired,
  fiat: PropTypes.bool,
};

Satoshi.defaultProps = {
  fiat: undefined,
};
