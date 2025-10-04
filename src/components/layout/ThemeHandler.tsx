import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUiSettings, ThemeMode } from "@/redux/preferences";

export default function ThemeHandler() {
  const { themeMode } = useSelector(selectUiSettings);
  useEffect(() => {
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    switch (themeMode) {
      case ThemeMode.System:
        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        break;
      case ThemeMode.Light:
        document.documentElement.classList.remove("dark");
        break;
      case ThemeMode.Dark:
        document.documentElement.classList.add("dark");
        break;
      default:
        break;
    }
  }, [themeMode]);
  return null;
}
