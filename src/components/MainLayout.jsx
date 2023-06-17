import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import { useSelector } from "react-redux";
import { selectScannerIsScanning } from "@/redux/device";

function MainLayout() {
  const isScanning = useSelector(selectScannerIsScanning);
  const bgColor = isScanning ? "bg-transparent" : "bg-white";
  return (
    <>
      <main className={ bgColor }>
        <Outlet />
        <BottomNavigation />
      </main>
    </>
  );
}

export default MainLayout;
