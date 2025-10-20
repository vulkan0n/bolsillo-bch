import { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DollarCircleOutlined,
  EuroCircleOutlined,
  TransactionOutlined,
  AccountBookOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";

import {
  selectCurrencySettings,
  selectIsPrerelease,
  selectIsExperimental,
} from "@/redux/preferences";

import { syncCauldronConnect } from "@/redux/sync";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";
import { currencyList } from "@/util/currency";
import { VALID_DENOMINATIONS } from "@/util/sats";

import Accordion from "@/atoms/Accordion";
import Select from "@/components/atoms/Select";

export default function CurrencySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const dispatch = useDispatch();

  const {
    shouldPreferLocalCurrency,
    localCurrency,
    denomination,
    shouldIncludeTokenSats,
    isStablecoinMode,
    shouldIncludeVolatileBalance,
  } = useSelector(selectCurrencySettings);

  const isPrerelease = useSelector(selectIsPrerelease);
  const isExperimental = useSelector(selectIsExperimental);

  const selectedCurrency = isStablecoinMode ? "USD" : localCurrency || "";

  const handleToggleStablecoinMode = (event) => {
    const isChecked = event.target.checked;
    handleSettingsUpdate("stablecoinMode", event.target.checked);

    if (isChecked) {
      setTimeout(() => dispatch(syncCauldronConnect()), 200);
    }
  };

  const handleToggleVolatileBalance = (event) => {
    const isChecked = event.target.checked;
    handleSettingsUpdate("includeVolatileBalance", event.target.checked);

    if (isChecked) {
      handleSettingsUpdate("displayExchangeRate", "true");
    }
  };

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
          value={selectedCurrency}
          disabled={isStablecoinMode}
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
      {/*(isExperimental || shouldIncludeTokenSats) && (
        <Accordion.Child
          icon={DollarCircleOutlined}
          label="Include Sats on Token UTXOs in Balance"
        >
          <input
            type="checkbox"
            checked={shouldIncludeTokenSats}
            onChange={(event) =>
              handleSettingsUpdate("includeTokenSats", event.target.checked)
            }
          />
        </Accordion.Child>
      )*/}
      {(isPrerelease || isStablecoinMode) && (
        <Accordion.Child
          icon={DollarCircleOutlined}
          label={translate(translations.enableStablecoinMode)}
          description={translate(translations.stablecoinModeExplanation)}
        >
          <input
            type="checkbox"
            checked={isStablecoinMode}
            onChange={handleToggleStablecoinMode}
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
            onChange={handleToggleVolatileBalance}
          />
        </Accordion.Child>
      )}
    </Accordion>
  );
}
