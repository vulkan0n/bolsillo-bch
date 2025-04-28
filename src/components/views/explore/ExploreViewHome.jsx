import {
  ContactsOutlined,
  //EnvironmentOutlined,
  ProductOutlined,
  ReadOutlined,
} from "@ant-design/icons";

import { useSelector } from "react-redux";
import { selectIsExperimental, selectIsPrerelease } from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import ExploreStatWidget from "./ExploreStatWidget";
import ExploreLegacyView from "./ExploreLegacyView";
import BlissAppCard from "@/apps/bliss/Card";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  return isPrerelease ? (
    <div className="p-1.5 flex flex-col gap-2">
      <ExploreStatWidget />
      {isPrerelease && (
        <ExploreApp icon={ProductOutlined} name="Apps" to="/apps" />
      )}
      {isExperimental && (
        <ExploreApp
          icon={ContactsOutlined}
          name="Contacts"
          to="/explore/contacts"
        />
      )}
      {/*{isExperimental && (
        <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
      )}*/}
      <ExploreApp
        icon={ReadOutlined}
        name={translate(translations.info)}
        to="/explore/info"
      />
      <BlissAppCard />
    </div>
  ) : (
    <ExploreLegacyView />
  );
}
