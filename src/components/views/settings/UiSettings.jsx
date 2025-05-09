import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  ControlOutlined,
  CompassOutlined,
  SyncOutlined,
  StockOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { selectUiSettings } from "@/redux/preferences";
import { selectDevicePlatform } from "@/redux/device";
import Accordion from "@/atoms/Accordion";
import { translate } from "@/util/translations";
import translations from "./translations";
import { SettingsContext } from "./SettingsContext";

export default function UiSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const {
    shouldDisplayExploreTab,
    shouldDisplayExchangeRate,
    shouldDisplaySyncCounter,
    shouldConstrainViewport,
  } = useSelector(selectUiSettings);

  const platform = useSelector(selectDevicePlatform);

  return (
    <Accordion
      icon={ControlOutlined}
      title={translate(translations.uiSettings)}
    >
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

      {platform === "web" &&
        document.querySelector("html").clientWidth > 480 && (
          <Accordion.Child
            icon={MobileOutlined}
            label={translate(translations.constrainViewport)}
          >
            <input
              type="checkbox"
              checked={shouldConstrainViewport}
              onChange={(event) =>
                handleSettingsUpdate(
                  "shouldConstrainViewport",
                  event.target.checked
                )
              }
            />
          </Accordion.Child>
        )}
    </Accordion>
  );
}
