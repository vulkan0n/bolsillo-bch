import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectLocale } from "@/redux/device";
import {
  selectCurrencySettings,
  selectPrivacySettings,
} from "@/redux/preferences";

import CurrencyService from "@/services/CurrencyService";
import { satsToBch } from "@/util/sats";

interface Props {
  value: number | bigint | string;
  fiat?: boolean;
  flip?: boolean;
}

export default function Satoshi({
  value = 0,
  fiat = undefined,
  flip = false,
}: Props) {
  const { shouldPreferLocalCurrency, localCurrency, denomination } =
    useSelector(selectCurrencySettings);
  const { shouldHideBalance } = useSelector(selectPrivacySettings);
  const locale = useSelector(selectLocale);

  const shouldDisplayFiat =
    fiat ||
    (fiat === undefined &&
      ((shouldPreferLocalCurrency && !flip) ||
        (!shouldPreferLocalCurrency && flip)));

  const formatIndex = shouldDisplayFiat ? "fiat" : denomination;

  const formatSatoshis = useCallback(
    (amount) => {
      if (!amount && amount.toString() !== "0") {
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
        bits: "₿",
        sats: "",
      };

      const bchUnit = {
        bch: "",
        mbch: "",
        bits: "",
        sats: "Ꞩ",
      };

      const absoluteAmounts = satsToBch(
        BigInt(amount) < 0n ? BigInt(amount) * -1n : BigInt(amount)
      );

      const formattedAmounts = {
        sats: new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
        }).format(absoluteAmounts.sats),
        bch: new Intl.NumberFormat(locale, { minimumFractionDigits: 8 }).format(
          absoluteAmounts.bch
        ),
        mbch: new Intl.NumberFormat(locale, {
          minimumFractionDigits: 5,
        }).format(absoluteAmounts.mbch),
        bits: new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
        }).format(absoluteAmounts.bits),
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
    },
    [denomination, localCurrency, locale, shouldHideBalance]
  );

  return <span>{formatSatoshis(value)[formatIndex]}</span>;
}
