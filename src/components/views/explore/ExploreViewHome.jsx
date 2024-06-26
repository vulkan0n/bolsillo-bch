import {
  ContactsOutlined,
  EnvironmentOutlined,
  LaptopOutlined,
  LikeOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  selectIsExperimental, selectIsPrerelease,
} from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import GlobalAdoptionSummary from "./stats/GlobalAdoptionSummary";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  return (
    <div className="p-2">
      <GlobalAdoptionSummary />
      {isPrerelease && (
        <ExploreApp
          icon={LineChartOutlined}
          name="Stats"
          to="/explore/stats"
        />
      )}
      {isPrerelease && (
        <ExploreApp
          icon={LikeOutlined}
          name="Social Media"
          to="/explore/socialMedia"
        />
      )}
      {isPrerelease && (
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
