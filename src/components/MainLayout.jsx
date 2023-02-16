import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomNavigation />
    </>
  );
}

export default MainLayout;
