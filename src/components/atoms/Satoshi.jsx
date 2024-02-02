import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectLocale } from "@/redux/device";
import { selectCurrencySettings } from "@/redux/preferences";

import CurrencyService from "@/services/CurrencyService";
import { satsToBch } from "@/util/sats";

export default function Satoshi({ value, fiat }) {
  const {
    shouldPreferLocalCurrency,
    shouldHideBalance,
    localCurrency,
    denomination,
  } = useSelector(selectCurrencySettings);
  const locale = useSelector(selectLocale);

  const shouldDisplayFiat =
    fiat || (shouldPreferLocalCurrency && fiat === undefined);

  const formatIndex = shouldDisplayFiat ? "fiat" : denomination;

  const formatSatoshis = (amount) => {
    if (!amount && amount !== 0) {
      return {
        bch: "-",
        mbch: "-",
        bits: "-",
        sats: "-",
        fiat: "-",
      };
    }

    // Don't leak number of digits when hiding balance
    if (shouldHideBalance) {
      return {
        bch: "XXXXXXXXXX",
        mbch: "XXXXXXXXXX",
        sats: "XXXXXXXXXX",
        bits: "XXXXXXXXXX",
        fiat: "XXXXXXXXXX",
      };
    }

    const Currency = CurrencyService(localCurrency);

    const bchSymbol = {
      bch: "₿",
      mbch: "₿",
      bits: "",
      sats: "",
    };

    const bchUnit = {
      bch: "",
      mbch: "mBCH",
      bits: "bits",
      sats: "sats",
    };

    const absoluteAmounts = satsToBch(Math.abs(amount));

    const formattedAmounts = {
      sats: new Intl.NumberFormat(locale).format(absoluteAmounts.sats),
      bch: new Intl.NumberFormat(locale, { minimumFractionDigits: 8 }).format(
        absoluteAmounts.bch
      ),
      mbch: new Intl.NumberFormat(locale, { minimumFractionDigits: 5 }).format(
        absoluteAmounts.mbch
      ),
      bits: new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(
        absoluteAmounts.bits
      ),
      fiat: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: localCurrency,
      }).format(Number.parseFloat(Currency.satsToFiat(absoluteAmounts.sats))),
    };

    const sign = amount < 0 ? "-" : "";
    const bchDisplay =
      `${sign}${bchSymbol[denomination]}${formattedAmounts[denomination]} ${bchUnit[denomination]}`.trim();

    const displayAmounts = {
      bch: bchDisplay,
      mbch: bchDisplay,
      bits: bchDisplay,
      sats: bchDisplay,
      fiat: `${sign}${formattedAmounts.fiat}`,
    };

    return displayAmounts;
  };

  return <span>{formatSatoshis(value)[formatIndex]}</span>;
}

Satoshi.propTypes = {
  value: PropTypes.number.isRequired,
  fiat: PropTypes.bool,
};

Satoshi.defaultProps = {
  fiat: undefined,
};
