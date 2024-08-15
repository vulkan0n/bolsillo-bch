import {
  //ContactsOutlined,
  EnvironmentOutlined,
  //QuestionCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectIsExperimental } from "@/redux/preferences";
import ExploreApp from "./ExploreApp";

import AppStatsWidget from "@/apps/stats/AppStatsWidget";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);

  return (
    <div className="p-2">
      <AppStatsWidget />
      {/*{isExperimental && (
        <ExploreApp
          icon={ContactsOutlined}
          name="Contacts"
          to="/explore/contacts"
        />
      )}*/}
      {isExperimental && (
        <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
      )}
      {/*{isExperimental && (
        <ExploreApp
          icon={QuestionCircleOutlined}
          name="Help"
          to="/explore/help"
        />
      )}*/}
    </div>
  );
}
