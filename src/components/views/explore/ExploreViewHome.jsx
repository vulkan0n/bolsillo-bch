import {
  ContactsOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import { ApolloProvider } from "@apollo/client";
import { useSelector } from "react-redux";
import { selectIsExperimental, selectIsPrerelease } from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import ExploreStatWidget from "./ExploreStatWidget";

import { translate } from "@/util/translations";
import translations from "./translations";
import apolloClient from "@/apolloClient";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  return (
    <div className="p-1.5">
      <ApolloProvider client={apolloClient}>
        <ExploreStatWidget />
      </ApolloProvider>
      {(isPrerelease || isExperimental) && (
        <ExploreApp icon={AppstoreOutlined} name="Apps" to="/apps" />
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
          icon={PlaySquareOutlined}
          name="Media"
          to="/explore/media"
        />
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
