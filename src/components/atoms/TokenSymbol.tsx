import { useSelector } from "react-redux";
import { selectIsDarkMode } from "@/redux/preferences";
import { getHighContrastBackground } from "@/util/color";

export default function TokenSymbol({
  token,
  lightBg = "#d4e7ba",
  darkBg = "#1d1c1b",
  className = "",
}) {
  const tokenColor = token.color;

  const isDarkMode = useSelector(selectIsDarkMode);

  const preferredBg = isDarkMode ? darkBg : lightBg;
  const highContrastBg = getHighContrastBackground(token.color, preferredBg);

  return (
    <span
      style={{ color: tokenColor, backgroundColor: highContrastBg }}
      className={`font-mono rounded px-0.5 ${className}`}
    >
      {token.symbol}
    </span>
  );
}
