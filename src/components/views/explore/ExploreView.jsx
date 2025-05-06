import { Outlet } from "react-router";
import { CompassOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import FullColumn from "@/layout/FullColumn";
//import ExploreSearchBar from "./ExploreSearchBar";
import { translate } from "@/util/translations";
import translations from "./translations";

export default function ExploreView() {
  return (
    <FullColumn>
      <ViewHeader
        icon={CompassOutlined}
        title={translate(translations.exploreBch)}
      />
      {/*<ExploreSearchBar />*/}
      <Outlet />
    </FullColumn>
  );
}
