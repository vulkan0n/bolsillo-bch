import { Outlet } from "react-router-dom";
import { AppstoreOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreSearchBar from "./ExploreSearchBar";

export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore BCH" />
      <ExploreSearchBar />
      <div className="my-0.5">
        <Outlet />
      </div>
    </>
  );
}
