import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import {
  SendOutlined,
  ThunderboltOutlined,
  PropertySafetyOutlined,
  MergeOutlined,
} from "@ant-design/icons";

import {
  selectInstantPaySettings,
  selectCurrencySettings,
  selectIsExperimental,
} from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

import CurrencyService from "@/services/CurrencyService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import Accordion from "@/atoms/Accordion";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import { SatoshiInput } from "@/atoms/SatoshiInput";

export default function PaymentSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const { localCurrency, shouldPreferLocalCurrency, shouldIncludeTokenSats } =
    useSelector(selectCurrencySettings);

  const isExperimental = useSelector(selectIsExperimental);

  const Currency = CurrencyService(localCurrency);

  const [instantPaySatInput, setInstantPaySatInput] =
    useState(instantPayThreshold);

  const handleInstantPayInput = (satInput) => {
    const instantPaySettingsKey = shouldPreferLocalCurrency
      ? "instantPayThresholdFiat"
      : "instantPayThreshold";

    const instantPaySettingsValue = shouldPreferLocalCurrency
      ? Currency.satsToFiat(satInput)
      : satInput;

    setInstantPaySatInput(satInput);
    handleSettingsUpdate(instantPaySettingsKey, instantPaySettingsValue);
  };

  return (
    <Accordion
      icon={SendOutlined}
      title={translate(translations.paymentSettings)}
    >
      <Accordion.Child
        icon={ThunderboltOutlined}
        label={translate(translations.allowInstantPay)}
      >
        <input
          type="checkbox"
          checked={isInstantPayEnabled}
          onChange={async (event) => {
            const { checked: isChecked } = event.target;
            const Security = SecurityService();
            const isAuthorized =
              isInstantPayEnabled === true ||
              (await Security.authorize(AuthActions.InstantPay)) ||
              (await Security.authorize(AuthActions.SendTransaction));

            if (isAuthorized) {
              handleSettingsUpdate("allowInstantPay", isChecked);
            }
          }}
        />
      </Accordion.Child>
      <Accordion.Child
        icon={PropertySafetyOutlined}
        label={translate(translations.instantPayLimit)}
        description={translate(translations.instantPayExplanation)}
      >
        <span className="text-neutral-600 flex items-center dark:text-neutral-300">
          <CurrencySymbol className="font-bold text-lg mr-1" />
          <SatoshiInput
            satoshis={instantPaySatInput}
            className="p-2 w-28 rounded flex-1 dark:bg-neutral-900 dark:text-neutral-100 dark:border-primarydark-400 border border-primary"
            onChange={handleInstantPayInput}
          />
        </span>
      </Accordion.Child>
      {(isExperimental || shouldIncludeTokenSats) && (
        <Accordion.Child
          icon={MergeOutlined}
          label="Allow spending from token UTXOs"
        >
          <input
            type="checkbox"
            checked={shouldIncludeTokenSats}
            onChange={(event) =>
              handleSettingsUpdate("includeTokenSats", event.target.checked)
            }
          />
        </Accordion.Child>
      )}
    </Accordion>
  );
}
