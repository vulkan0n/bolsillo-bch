import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  DollarCircleOutlined,
  EuroCircleOutlined,
  TransactionOutlined,
  AccountBookOutlined,
  FundOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";

import {
  selectCurrencySettings,
  selectIsPrerelease,
} from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";
import { currencyList } from "@/util/currency";
import { VALID_DENOMINATIONS } from "@/util/sats";

import Accordion from "@/atoms/Accordion";
import Select from "@/components/atoms/Select";

export default function CurrencySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);

  const {
    shouldPreferLocalCurrency,
    localCurrency,
    denomination,
    isStablecoinMode,
    shouldIncludeVolatileBalance,
  } = useSelector(selectCurrencySettings);

  const isPrerelease = useSelector(selectIsPrerelease);

  // force USD as local currency when in stablecoin mode
  const localCurrencySelection = isStablecoinMode ? "USD" : localCurrency;

  return (
    <Accordion
      icon={DollarCircleOutlined}
      title={translate(translations.currencySettings)}
    >
      <Accordion.Child
        icon={EuroCircleOutlined}
        label={translate(translations.localCurrency)}
      >
        <Select
          className="w-fit"
          value={localCurrencySelection || ""}
          onChange={(event) =>
            handleSettingsUpdate("localCurrency", event.target.value)
          }
        >
          {currencyList
            .filter(
              (c) =>
                VALID_DENOMINATIONS.find(
                  (d) => d.toLowerCase() === c.currency.toLowerCase()
                ) === undefined
            )
            .map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.currency} {c.symbol}
              </option>
            ))}
        </Select>
      </Accordion.Child>
      <Accordion.Child
        icon={TransactionOutlined}
        label={translate(translations.preferLocalCurrency)}
      >
        <input
          type="checkbox"
          checked={shouldPreferLocalCurrency}
          onChange={(event) =>
            handleSettingsUpdate("preferLocalCurrency", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={AccountBookOutlined}
        label={translate(translations.denominateInSats)}
      >
        <Select
          className="w-24"
          value={denomination}
          onChange={(event) =>
            handleSettingsUpdate(
              "denomination",
              event.target.value.toLowerCase()
            )
          }
        >
          {VALID_DENOMINATIONS.map((d) => (
            <option key={d} id={d} value={d.toLowerCase()}>
              {d}
            </option>
          ))}
        </Select>
      </Accordion.Child>
      {(isPrerelease || isStablecoinMode) && (
        <Accordion.Child
          icon={FundOutlined}
          label={translate(translations.enableStablecoinMode)}
          description={translate(translations.stablecoinModeExplanation)}
        >
          <input
            type="checkbox"
            checked={isStablecoinMode}
            onChange={(event) =>
              handleSettingsUpdate("stablecoinMode", event.target.checked)
            }
          />
        </Accordion.Child>
      )}
      {isStablecoinMode && (
        <Accordion.Child
          icon={MoneyCollectOutlined}
          label={translate(translations.includeVolatileBalance)}
        >
          <input
            type="checkbox"
            checked={shouldIncludeVolatileBalance}
            onChange={(event) =>
              handleSettingsUpdate(
                "includeVolatileBalance",
                event.target.checked
              )
            }
          />
        </Accordion.Child>
      )}
    </Accordion>
  );
}
