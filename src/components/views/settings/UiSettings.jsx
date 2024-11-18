import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  ControlOutlined,
  CompassOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SyncOutlined,
  StockOutlined,
} from "@ant-design/icons";
import { selectUiSettings } from "@/redux/preferences";
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
    shouldDisplayExchangeRate,
    shouldDisplaySyncCounter,
  } = useSelector(selectUiSettings);

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
        icon={StockOutlined}
        label={translate(translations.displayExchangeRate)}
      >
        <input
          type="checkbox"
          checked={shouldDisplayExchangeRate}
          onChange={(event) =>
            handleSettingsUpdate("displayExchangeRate", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={CompassOutlined}
        label={translate(translations.displayExploreTab)}
      >
        <input
          type="checkbox"
          checked={shouldDisplayExploreTab}
          onChange={(event) =>
            handleSettingsUpdate("displayExploreTab", event.target.checked)
          }
        />
      </Accordion.Child>

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
    </Accordion>
  );
}
