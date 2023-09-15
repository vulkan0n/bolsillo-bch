import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  DollarCircleOutlined,
  EuroCircleOutlined,
  TransactionOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  AccountBookOutlined,
  StockOutlined,
} from "@ant-design/icons";

import {
  selectCurrencySettings,
  selectDenomination,
} from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";

import { SettingsContext } from "./SettingsContext";
import { currencyList } from "@/util/currency";

import Accordion from "@/atoms/Accordion";

export default function CurrencySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);

  const {
    localCurrency,
    shouldPreferLocalCurrency,
    shouldHideBalance,
    shouldDisplayExchangeRate,
  } = useSelector(selectCurrencySettings);

  const shouldDenominateSats = useSelector(selectDenomination) === "sats";

  return (
    <Accordion
      icon={DollarCircleOutlined}
      title={translate(translations.currencySettings)}
    >
      <Accordion.Child
        icon={EuroCircleOutlined}
        label={translate(translations.localCurrency)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-24"
          value={localCurrency || ""}
          onChange={(event) =>
            handleSettingsUpdate("localCurrency", event.target.value)
          }
        >
          {currencyList
            .filter((c) => c.currency !== "BCH")
            .map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.currency} {c.symbol}
              </option>
            ))}
        </select>
      </Accordion.Child>
      <Accordion.Child
        icon={TransactionOutlined}
        label={translate(translations.preferLocalCurrency)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldPreferLocalCurrency}
          onChange={(event) =>
            handleSettingsUpdate("preferLocalCurrency", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined}
        label={translate(translations.hideAvailableBalance)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldHideBalance}
          onChange={(event) =>
            handleSettingsUpdate("hideAvailableBalance", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={AccountBookOutlined}
        label={translate(translations.denominateInSats)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldDenominateSats}
          onChange={(event) =>
            handleSettingsUpdate("denominateSats", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={StockOutlined}
        label={translate(translations.displayExchangeRate)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldDisplayExchangeRate}
          onChange={(event) =>
            handleSettingsUpdate("displayExchangeRate", event.target.checked)
          }
        />
      </Accordion.Child>
    </Accordion>
  );
}
