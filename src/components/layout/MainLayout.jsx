import { App } from "@capacitor/app";
import { Outlet, useNavigate } from "react-router";
import { validateBchUri } from "@/util/uri";
import BottomNavigation from "./BottomNavigation";

export default function MainLayout() {
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

  // [!] see index.css for #container and <main> styles
  return (
    <div id="container">
      <main>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
