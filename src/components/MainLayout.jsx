import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  );
}

export default MainLayout;
