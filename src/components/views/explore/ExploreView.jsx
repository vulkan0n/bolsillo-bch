import { Outlet, Link } from "react-router";
import { CompassOutlined, SettingOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import FullColumn from "@/layout/FullColumn";
//import ExploreSearchBar from "./ExploreSearchBar";
import { translate } from "@/util/translations";
import translations from "./translations";

function ExploreViewAccessory() {
  return (
    <Link to="/settings" className="flex items-center justify-center">
      <SettingOutlined className="text-2xl ml-2" />
    </Link>
  );
}

export default function ExploreView() {
  return (
    <FullColumn>
      <ViewHeader
        icon={CompassOutlined}
        title={translate(translations.exploreBch)}
        accessory={ExploreViewAccessory}
      />
      {/*<ExploreSearchBar />*/}
      <Outlet />
    </FullColumn>
  );
}
