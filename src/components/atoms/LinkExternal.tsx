import {
  InAppBrowser,
  DefaultSystemBrowserOptions,
} from "@capacitor/inappbrowser";
import { useSelector } from "react-redux";
import { selectDevicePlatform } from "@/redux/device";

export default function LinkExternal({
  to,
  children,
  inAppBrowser = false,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  inAppBrowser?: boolean;
  className?: string;
}) {
  const platform = useSelector(selectDevicePlatform);

  const handleClick = (e) => {
    if (inAppBrowser && platform !== "web") {
      e.preventDefault();
      InAppBrowser.openInSystemBrowser({
        url: to,
        options: DefaultSystemBrowserOptions,
      });
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
