import { useContext } from "react";
import { useSelector } from "react-redux";
import { ControlOutlined, CompassOutlined } from "@ant-design/icons";
import { selectUiSettings } from "@/redux/preferences";
import { SettingsContext } from "../SettingsContext";
import Accordion from "@/atoms/Accordion";

import { translate } from "@/util/translations";
import translations from "./UiSettingsTranslations";

const { uiSettings, showExploreTab } = translations;

export default function UiSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { shouldDisplayExploreTab } = useSelector(selectUiSettings);

  return (
    <Accordion icon={ControlOutlined} title={translate(uiSettings)}>
      <Accordion.Child icon={CompassOutlined} label={translate(showExploreTab)}>
        <input
          type="checkbox"
          checked={shouldDisplayExploreTab}
          onChange={(event) =>
            handleSettingsUpdate("displayExploreTab", event.target.checked)
          }
        />
      </Accordion.Child>
    </Accordion>
  );
}
