import { ApolloProvider } from "@apollo/client";
import {
  ContactsOutlined,
  EnvironmentOutlined,
  ProfileOutlined,
  LaptopOutlined,
  LikeOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  selectIsExperimental, selectIsPrerelease,
} from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import ExploreStatBlock from "./stats/ExploreStatBlock";

import { translate } from "@/util/translations";
import translations from "./ExploreViewTranslations";

const {
  statistics,
  socialMedia,
  chronology
} = translations;

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  return (
    <div className="p-2 pb-16">
      <ExploreStatBlock />
      {isPrerelease && (
        <ExploreApp
          icon={LineChartOutlined}
          name={translate(statistics)}
          to="/explore/stats"
        />
      )}
      {isPrerelease && (
        <ExploreApp
          icon={InfoCircleOutlined}
          name={"FAQs & Information"}
          to="/explore/faqs"
        />
      )}
      {isPrerelease && (
        <ExploreApp
          icon={LikeOutlined}
          name={translate(socialMedia)}
          to="/explore/socialMedia"
        />
      )}
      {isPrerelease && (
        <ExploreApp
          icon={ProfileOutlined}
          name={translate(chronology)}
          to="/explore/chronology"
        />
      )}
      {isPrerelease && (
        <ExploreApp
          icon={LaptopOutlined}
          name="A Fifth Of Gaming"
          to="/explore/afog"
        />
      )}
      {
        isExperimental && (
          <ExploreApp
            icon={ContactsOutlined}
            name="Contacts"
            to="/explore/contacts"
          />
        )
      }
      {
        isExperimental && (
          <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
        )
      }
      {
        isExperimental && (
          <ExploreApp
            icon={QuestionCircleOutlined}
            name="Help"
            to="/explore/help"
          />
        )
      }
    </div >
  );
}
