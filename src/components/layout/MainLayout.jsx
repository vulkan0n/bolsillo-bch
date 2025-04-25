import { App } from "@capacitor/app";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router";
import { selectScannerIsScanning, selectDevicePlatform } from "@/redux/device";
import { validateBchUri } from "@/util/uri";
import BottomNavigation from "./BottomNavigation";

import useScrollToTop from "@/hooks/useScrollToTop";

export default function MainLayout() {
  const navigate = useNavigate();
  useScrollToTop();

  const platform = useSelector(selectDevicePlatform);
  useEffect(
    function setPlatformCss() {
      if (platform === "web") {
        document
          .querySelector("body")
          .classList.add(
            "border-8",
            "border-neutral-1000",
            "rounded-lg",
            "shadow-xl"
          );
      }

      return () => {
        document
          .querySelector("body")
          .classList.remove(
            "border-8",
            "border-neutral-1000",
            "rounded-lg",
            "shadow-xl"
          );
      };
    },
    [platform]
  );

  const isScanning = useSelector(selectScannerIsScanning);
  useEffect(
    function forceTransparentContainer() {
      const isOverlayOpen = isScanning;

      if (isOverlayOpen) {
        document.querySelector("html").classList.add("bg-transparent");
        document.querySelector("html").classList.remove("bg-neutral-1000/90");
      }

      return () => {
        document.querySelector("html").classList.remove("bg-transparent");
        document.querySelector("html").classList.add("bg-neutral-1000/90");
      };
    },
    [isScanning]
  );

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
    <div
      id="container"
      className={`${isScanning ? "bg-transparent" : "bg-primary-50"}`}
    >
      <main>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
