import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  return (
    <>
      <div className="pb-12">
        <Outlet />
      </div>
      <BottomNavigation />
    </>
  );
}

export default MainLayout;
