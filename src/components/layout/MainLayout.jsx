import { App } from "@capacitor/app";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import { validateInvoiceString } from "@/util/invoice";
import { validateWifString } from "@/util/sweep";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  const isScanning = useSelector(selectScannerIsScanning);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const bgColor = isScanning ? "bg-transparent" : "bg-white";
  const padding = isKeyboardOpen ? "" : "bottomPadding";

  const navigate = useNavigate();

  App.addListener("appUrlOpen", ({ url }) => {
    const { isValid, address, query } = validateInvoiceString(url);
    const { isWif, wif } = validateWifString(url);

    if (isValid) {
      navigate(`/wallet/send/${address}${query}`);
    } else if (isWif) {
      navigate(`/wallet/sweep/${wif}`);
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
