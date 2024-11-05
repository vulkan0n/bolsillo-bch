import { App } from "@capacitor/app";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";
import { validateBchUri } from "@/util/uri";
import BottomNavigation from "./BottomNavigation";

function MainLayout() {
  const isScanning = useSelector(selectScannerIsScanning);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const bgColor = isScanning ? "bg-transparent" : "bg-white";
  const padding = isKeyboardOpen ? "" : "bottomPadding";

  const navigate = useNavigate();

  App.addListener("appUrlOpen", ({ url }) => {
    const {
      isValid,
      isPaymentProtocol,
      isWif,
      address,
      query,
      requestUri,
      wif,
    } = validateBchUri(url);

    if (isValid) {
      let navTo;
      if (isPaymentProtocol) {
        navTo = `/wallet/pay/?r=${requestUri}`;
      } else if (isWif) {
        navTo = `/wallet/sweep/${wif}`;
      } else {
        navTo = `/wallet/send/${address}${query}`;
      }

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
