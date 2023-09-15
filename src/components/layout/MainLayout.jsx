import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  const isScanning = useSelector(selectScannerIsScanning);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const bgColor = isScanning ? "bg-transparent" : "bg-white";
  const padding = isKeyboardOpen ? "" : "bottomPadding";

  return (
    <main className={`${bgColor} ${padding}`}>
      <Outlet />
      <BottomNavigation />
    </main>
  );
}

export default MainLayout;
