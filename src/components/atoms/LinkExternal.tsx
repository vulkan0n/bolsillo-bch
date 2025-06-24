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

  const handleClick = () => {
    if (inAppBrowser && platform !== "web") {
      //e.preventDefault();
      // open in-app browser
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
