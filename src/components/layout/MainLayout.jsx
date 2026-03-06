import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router";
import { App } from "@capacitor/app";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { selectScannerIsScanning, selectDevicePlatform } from "@/redux/device";
import {
  selectShouldConstrainViewport,
  selectIsDarkMode,
  selectIsVendorModeActive,
} from "@/redux/preferences";

import NotificationService from "@/kernel/app/NotificationService";

import useScrollToTop from "@/hooks/useScrollToTop";

import { navigateOnValidUri } from "@/util/uri";

import BottomNavigation from "./BottomNavigation";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  useScrollToTop();

  const platform = useSelector(selectDevicePlatform);
  const shouldConstrainViewport = useSelector(selectShouldConstrainViewport);
  const isVendorModeActive = useSelector(selectIsVendorModeActive);

  const isDarkMode = useSelector(selectIsDarkMode);

  const html = useMemo(() => document.querySelector("html"), []);
  const body = useMemo(() => document.querySelector("body"), []);

  useEffect(
    function setDarkModeCss() {
      if (!html) {
        return () => {};
      }

      if (isDarkMode) {
        html.classList.add("dark");
      }

      return () => {
        html.classList.remove("dark");
      };
    },
    [html, isDarkMode]
  );

  useEffect(
    function setPlatformCss() {
      if (!html || !body) {
        return () => {};
      }

      // add fake "phone" border on web if window is larger than 480px wide
      if (
        platform === "web" &&
        html.clientWidth > 480 &&
        shouldConstrainViewport
      ) {
        body.classList.add(
          "border-8",
          "border-neutral-1000",
          "rounded-lg",
          "shadow-xl"
        );

        // Use landscape dimensions for vendor mode, portrait otherwise
        if (isVendorModeActive) {
          body.style.maxWidth = "960px";
          body.style.maxHeight = "480px";
        } else {
          body.style.maxWidth = "480px";
          body.style.maxHeight = "960px";
        }
      }

      return () => {
        body.classList.remove(
          "border-8",
          "border-neutral-1000",
          "rounded-lg",
          "shadow-xl"
        );

        body.style.maxWidth = "";
        body.style.maxHeight = "";
      };
    },
    [platform, shouldConstrainViewport, isVendorModeActive, html, body]
  );

  // Lock to portrait unless in vendor mode (which handles its own landscape lock)
  useEffect(
    function lockPortraitOrientation() {
      if (platform === "web") {
        return;
      }

      // When not in vendor mode, lock to portrait
      if (!isVendorModeActive) {
        ScreenOrientation.lock({ orientation: "portrait" });
      }
    },
    [platform, isVendorModeActive]
  );

  // Enforce vendor mode — redirect back if user somehow navigates away
  useEffect(
    function enforceVendorMode() {
      if (isVendorModeActive && location.pathname !== "/vendor") {
        navigate("/vendor");
      }
    },
    [isVendorModeActive, location.pathname, navigate]
  );

  const isScanning = useSelector(selectScannerIsScanning);
  useEffect(
    function forceTransparentContainer() {
      const isOverlayOpen = isScanning;

      if (!html) {
        return () => {};
      }

      if (isOverlayOpen) {
        html.classList.add("bg-transparent");
        html.classList.remove("bg-neutral-1000/90");
      }

      return () => {
        html.classList.remove("bg-transparent");
        html.classList.add("bg-neutral-1000/90");
      };
    },
    [isScanning, html]
  );

  useEffect(
    function registerAppUrlListener() {
      const listener = App.addListener("appUrlOpen", async ({ url }) => {
        const { navTo, navState, isExpired } = await navigateOnValidUri(url);
        if (isExpired) {
          NotificationService().expiredPayment();
        } else if (navTo) {
          navigate(navTo, { state: navState });
        }
      });

      return () => {
        listener.then((l) => l.remove());
      };
    },
    [navigate]
  );

  // [!] see index.css for #container and <main> styles
  return (
    <>
      <div
        id="scannerOutput"
        className={`${!isScanning ? "opacity-0" : ""} bg-transparent`}
      />
      <div
        id="container"
        className={`${isScanning ? "bg-transparent" : "bg-primary-50 dark:bg-primarydark-50 dark:text-neutral-50"}`}
      >
        <main>
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </>
  );
}
