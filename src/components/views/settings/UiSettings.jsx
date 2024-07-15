import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  ControlOutlined,
  CompassOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { selectUiSettings } from "@/redux/preferences";
import SecurityService from "@/services/SecurityService";
import Accordion from "@/atoms/Accordion";
import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";
import { SettingsContext } from "./SettingsContext";

const { uiSettings, hideExploreTab } = translations;

export default function UiSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { shouldHideBalance, shouldDisplayExploreTab } =
    useSelector(selectUiSettings);

  return (
    <Accordion icon={ControlOutlined} title={translate(uiSettings)}>
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
              (await SecurityService().authorize());

            if (isAuthorized) {
              handleSettingsUpdate("hideAvailableBalance", isChecked);
            }
          }}
        />
      </Accordion.Child>
      <Accordion.Child icon={CompassOutlined} label={translate(hideExploreTab)}>
        <input
          type="checkbox"
          checked={!shouldDisplayExploreTab}
          onChange={(event) =>
            handleSettingsUpdate("displayExploreTab", !event.target.checked)
          }
        />
      </Accordion.Child>
    </Accordion>
  );
}
