import {
  ContactsOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectIsExperimental } from "@/redux/preferences";
import ExploreStatBlock from "./ExploreStatBlock";
import ExploreApp from "./ExploreApp";
import StatsView from "./stats/ExploreStatsView";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);

  return (
    <div className="p-2">
      <ExploreStatBlock />
      <StatsView />
      {isExperimental && (
        <ExploreApp
          icon={ContactsOutlined}
          name="Contacts"
          to="/explore/contacts"
        />
      )}
      {isExperimental && (
        <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
      )}
      {isExperimental && (
        <ExploreApp
          icon={QuestionCircleOutlined}
          name="Help"
          to="/explore/help"
        />
      )}
    </div>
  );
}
