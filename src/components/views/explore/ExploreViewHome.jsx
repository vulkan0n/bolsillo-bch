import {
  ContactsOutlined,
  EnvironmentOutlined,
  LaptopOutlined,
  LikeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectIsExperimental } from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import StatsView from "./stats/ExploreStatsView";
import GlobalAdoptionSummary from "./stats/GlobalAdoptionSummary";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);

  return (
    <div className="p-2">
      <GlobalAdoptionSummary />
      {isExperimental && (
        <ExploreApp
          icon={LikeOutlined}
          name="Social Media"
          to="/explore/socialMedia"
        />
      )}
      {isExperimental && (
        <ExploreApp
          icon={LaptopOutlined}
          name="A Fifth Of Gaming"
          to="/explore/afog"
        />
      )}
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
