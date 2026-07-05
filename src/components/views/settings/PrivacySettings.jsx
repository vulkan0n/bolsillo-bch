import { useContext } from "react";
import { useSelector } from "react-redux";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

import { selectShouldHideBalance } from "@/redux/preferences";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import Accordion from "@/atoms/Accordion";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

export default function PrivacySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const shouldHideBalance = useSelector(selectShouldHideBalance);

  return (
    <Accordion
      icon={EyeInvisibleOutlined}
      title={translate(translations.privacySettings)}
    >
      <Accordion.Child
        icon={shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined}
        label={translate(translations.hideAvailableBalance)}
      >
        <input
          type="checkbox"
          checked={shouldHideBalance}
          onChange={async (event) => {
            const { checked: isChecked } = event.target;
            const isAuthorized =
              shouldHideBalance === false ||
              (await SecurityService().authorize(AuthActions.RevealBalance));

            if (isAuthorized) {
              handleSettingsUpdate("hideAvailableBalance", isChecked);
            }
          }}
        />
      </Accordion.Child>
    </Accordion>
  );
}
