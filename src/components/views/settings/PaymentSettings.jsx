import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import {
  PropertySafetyOutlined,
  QrcodeOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import {
  selectCurrencySettings,
  selectInstantPaySettings,
  selectIsExpertMode,
  selectSecuritySettings,
  selectShouldUseLegacyBip21,
} from "@/redux/preferences";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import CurrencyService from "@/kernel/bch/CurrencyService";

import Accordion from "@/atoms/Accordion";
import Checkbox from "@/atoms/Checkbox";
import CurrencySymbol from "@/atoms/CurrencySymbol";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

export default function PaymentSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);
  const isExpertMode = useSelector(selectIsExpertMode);
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const { localCurrency, shouldPreferLocalCurrency } = useSelector(
    selectCurrencySettings
  );

  const { authMode } = useSelector(selectSecuritySettings);
  const hasAuthConfigured = authMode !== "none";

  const shouldUseLegacyBip21 = useSelector(selectShouldUseLegacyBip21);

  const Currency = CurrencyService(localCurrency);

  // Show value in fiat when preferLocalCurrency is on, in sats otherwise
  const initialDisplayValue = shouldPreferLocalCurrency
    ? preferences.instantPayThresholdFiat
    : instantPayThreshold;

  const [instantPayDisplayInput, setInstantPayDisplayInput] =
    useState(initialDisplayValue);

  const handleInstantPayInput = (inputValue) => {
    const instantPaySettingsKey = shouldPreferLocalCurrency
      ? "instantPayThresholdFiat"
      : "instantPayThreshold";

    const instantPaySettingsValue = shouldPreferLocalCurrency
      ? inputValue
      : inputValue;

    setInstantPayDisplayInput(inputValue);
    handleSettingsUpdate(instantPaySettingsKey, instantPaySettingsValue);
  };

  if (!hasAuthConfigured) return null;

  return (
    <Accordion
      icon={SendOutlined}
      title={translate(translations.paymentSettings)}
      open
      locked
    >
      <Accordion.Child
        icon={ThunderboltOutlined}
        label={translate(translations.allowInstantPay)}
        description={translate(translations.allowInstantPayDescription)}
      >
        <Checkbox
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
          <input
            type="number"
            value={instantPayDisplayInput}
            className="p-2 w-28 rounded flex-1 dark:bg-neutral-900 dark:text-neutral-100 dark:border-primarydark-400 border border-primary"
            onChange={(e) => handleInstantPayInput(e.target.value)}
          />
        </span>
      </Accordion.Child>
      {isExpertMode && (
        <Accordion.Child
          icon={QrcodeOutlined}
          label={translate(translations.useLegacyBip21)}
          description={translate(translations.useLegacyBip21Description)}
        >
          <Checkbox
            checked={shouldUseLegacyBip21}
            onChange={(event) => {
              handleSettingsUpdate("useLegacyBip21", event.target.checked);
            }}
          />
        </Accordion.Child>
      )}
    </Accordion>
  );
}
