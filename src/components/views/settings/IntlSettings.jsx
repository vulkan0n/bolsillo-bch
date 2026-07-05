import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  FlagOutlined,
  GlobalOutlined,
  SunFilled,
} from "@ant-design/icons";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

import { selectShouldHideBalance, ThemeMode } from "@/redux/preferences";

import Accordion from "@/atoms/Accordion";
import Select from "@/components/atoms/Select";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import { sameAsDevice } from "@/translations/common";
import { languageList, translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

export default function IntlSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);

  const shouldHideBalance = useSelector(selectShouldHideBalance);

  return (
    <Accordion
      icon={GlobalOutlined}
      title={translate(translations.personalizar)}
    >
      <Accordion.Child
        icon={SunFilled}
        label={translate(translations.themeMode)}
      >
        <Select
          onChange={(e) => handleSettingsUpdate("themeMode", e.target.value)}
          value={preferences.themeMode}
        >
          <option value={ThemeMode.System}>
            {translate(translations.themeModeSystem)}
          </option>
          <option value={ThemeMode.Light}>
            {translate(translations.themeModeLight)}
          </option>
          <option value={ThemeMode.Dark}>
            {translate(translations.themeModeDark)}
          </option>
        </Select>
      </Accordion.Child>
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
      <Accordion.Child
        icon={FlagOutlined}
        label={translate(translations.language)}
      >
        <Select
          className="w-48 w-2/3"
          value={preferences.languageCode || ""}
          onChange={(event) => {
            handleSettingsUpdate("languageCode", event.target.value);
          }}
        >
          {languageList.map(({ flag, code, name }) => (
            <option key={code} value={code}>
              {code
                ? `${flag} ${code.toUpperCase()} - ${name}`
                : translate(sameAsDevice)}
            </option>
          ))}
        </Select>
      </Accordion.Child>
    </Accordion>
  );
}
