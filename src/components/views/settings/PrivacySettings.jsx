import { useContext } from "react";
import { useSelector } from "react-redux";
import { EyeInvisibleOutlined, AreaChartOutlined } from "@ant-design/icons";
import { selectPrivacySettings } from "@/redux/preferences";
import Accordion from "@/atoms/Accordion";
import { translate } from "@/util/translations";
import translations from "./translations";
import { SettingsContext } from "./SettingsContext";

const { privacySettings, sendDailyCheckIn } = translations;

export default function PrivacySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { isDailyCheckInEnabled } = useSelector(selectPrivacySettings);

  return (
    <Accordion icon={EyeInvisibleOutlined} title={translate(privacySettings)}>
      <Accordion.Child
        icon={AreaChartOutlined}
        label={translate(sendDailyCheckIn)}
      >
        <input
          type="checkbox"
          checked={isDailyCheckInEnabled}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            handleSettingsUpdate("enableDailyCheckIn", isChecked);
          }}
        />
      </Accordion.Child>
    </Accordion>
  );
}
