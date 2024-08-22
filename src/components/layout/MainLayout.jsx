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
    const { isValid, address, query, isPaymentProtocol, requestUri } =
      validateInvoiceString(url);

    if (isValid) {
      const navTo = isPaymentProtocol
        ? `/wallet/pay/?r=${requestUri}`
        : `/wallet/send/${address}${query}`;

      navigate(navTo);
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
