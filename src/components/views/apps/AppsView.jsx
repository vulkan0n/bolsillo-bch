import {
  AppstoreOutlined,
  ProfileOutlined,
  LaptopOutlined,
  LikeOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreApp from "@/views/explore/ExploreApp";

import { translate } from "@/util/translations";
import translations from "@/views/explore/translations";

export default function AppsView() {
  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Apps" />
      <div className="p-1">
        <ExploreApp
          icon={LaptopOutlined}
          name="A Fifth Of Gaming"
          to="/apps/afog"
        />
        <ExploreApp
          icon={ProfileOutlined}
          name={translate(translations.chronology)}
          to="/apps/chronology"
        />
        <ExploreApp
          icon={LineChartOutlined}
          name={translate(translations.statistics)}
          to="/apps/stats"
        />
        <ExploreApp
          icon={InfoCircleOutlined}
          name={translate(translations.faqs)}
          to="/apps/faqs"
        />
        <ExploreApp
          icon={LikeOutlined}
          name={translate(translations.socialMedia)}
          to="/apps/socialMedia"
        />
      </div>
    </>
  );
}
