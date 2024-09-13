import { App } from "@capacitor/app";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import { validateInvoiceString } from "@/util/invoice";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  const isScanning = useSelector(selectScannerIsScanning);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const bgColor = isScanning ? "bg-transparent" : "bg-white";
  const padding = isKeyboardOpen ? "" : "bottomPadding";

  const navigate = useNavigate();

  App.addListener("appUrlOpen", ({ url }) => {
    const { isValid, address, query } = validateInvoiceString(url);
    if (isValid) {
      navigate(`/wallet/send/${address}${query}`);
    }
  });

  return (
    <main className={`${bgColor} ${padding}`}>
      <Outlet />
      <BottomNavigation />
    </main>
  );
}

export default MainLayout;
