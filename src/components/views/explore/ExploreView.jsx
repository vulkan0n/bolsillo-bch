import { Outlet } from "react-router-dom";
import { CompassOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreSearchBar from "./ExploreSearchBar";

export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={CompassOutlined} title="Explore BCH" />
      <ExploreSearchBar />
      <div className="my-0.5">
        <Outlet />
      </div>
    </>
  );
}
