import { ApolloProvider } from "@apollo/client";
import {
  ContactsOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectIsExperimental } from "@/redux/preferences";
import ExploreStatBlock from "./ExploreStatBlock";
import ExploreApp from "./ExploreApp";
import ExploreStatsView from "./stats/ExploreStatsView";
import apolloClient from "@/apolloClient";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);

  return (
    <div className="p-2">
      <ApolloProvider client={apolloClient}>
        <ExploreStatBlock />
        <ExploreStatsView />
      </ApolloProvider>
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
