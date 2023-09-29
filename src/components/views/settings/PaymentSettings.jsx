import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import {
  SendOutlined,
  ThunderboltOutlined,
  PropertySafetyOutlined,
} from "@ant-design/icons";

import { selectInstantPaySettings } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";

import { SettingsContext } from "./SettingsContext";

import Accordion from "@/atoms/Accordion";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import SatoshiInput from "@/atoms/SatoshiInput";
import { satsToDisplayAmount } from "@/util/sats";

export default function PaymentSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);
  const { instantPayThreshold } = useSelector(selectInstantPaySettings);

  const [instantPaySatInput, setInstantPaySatInput] = useState({
    display: satsToDisplayAmount(instantPayThreshold),
    sats: instantPayThreshold,
  });

  const handleInstantPayInput = (satInput) => {
    setInstantPaySatInput(satInput);
    handleSettingsUpdate("instantPayThreshold", satInput.sats);
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
          checked={preferences.allowInstantPay === "true"}
          onChange={(event) =>
            handleSettingsUpdate("allowInstantPay", event.target.checked)
          }
        />
      </Accordion.Child>
      {/*<Accordion.Child>
        <span className="text-zinc-600">
          {translate(translations.instantPayExplanation)}
        </span>
      </Accordion.Child>*/}
      <Accordion.Child
        icon={PropertySafetyOutlined}
        label={translate(translations.instantPayLimit)}
      >
        <span className="text-zinc-600">
          <CurrencySymbol className="font-bold" />
          <SatoshiInput
            satoshiInput={instantPaySatInput}
            className="p-2 w-28 rounded mx-1"
            onChange={handleInstantPayInput}
          />
        </span>
      </Accordion.Child>
    </Accordion>
  );
}
