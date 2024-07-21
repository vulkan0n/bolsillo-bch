import { Outlet } from "react-router-dom";
import { CompassOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreSearchBar from "./ExploreSearchBar";
import { translate } from "@/util/translations";
import translations from "./ExploreViewTranslations";

const { exploreBch } = translations;

export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={CompassOutlined} title={translate(exploreBch)} />
      {/* <ExploreSearchBar /> */}
      <Outlet />
    </>
  );
}
