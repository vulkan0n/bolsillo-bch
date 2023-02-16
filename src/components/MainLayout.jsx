import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  return (
    <div className="mx-auto rounded outline-1 outline-slate-800">
      <Outlet />
      <BottomNavigation />
    </div>
  );
}

export default MainLayout;
