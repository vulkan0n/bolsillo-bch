import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  ControlOutlined,
  CompassOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { selectUiSettings, selectIsExperimental } from "@/redux/preferences";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import Accordion from "@/atoms/Accordion";
import { translate } from "@/util/translations";
import translations from "./translations";
import { SettingsContext } from "./SettingsContext";

export default function UiSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const {
    shouldHideBalance,
    shouldDisplayExploreTab,
    shouldDisplaySyncCounter,
  } = useSelector(selectUiSettings);

  const isExperimental = useSelector(selectIsExperimental);

  return (
    <Accordion
      icon={ControlOutlined}
      title={translate(translations.uiSettings)}
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
      <Accordion.Child
        icon={CompassOutlined}
        label={translate(translations.hideExploreTab)}
      >
        <input
          type="checkbox"
          checked={!shouldDisplayExploreTab}
          onChange={(event) =>
            handleSettingsUpdate("displayExploreTab", !event.target.checked)
          }
        />
      </Accordion.Child>
      {isExperimental && (
        <Accordion.Child
          icon={SyncOutlined}
          label={translate(translations.displaySyncCounter)}
        >
          <input
            type="checkbox"
            checked={shouldDisplaySyncCounter}
            onChange={(event) =>
              handleSettingsUpdate("displaySyncCounter", event.target.checked)
            }
          />
        </Accordion.Child>
      )}
    </Accordion>
  );
}
