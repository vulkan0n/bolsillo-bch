import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  return (
    <div>
      <Outlet />
      <BottomNavigation />
    </div>
  );
}

export default MainLayout;
