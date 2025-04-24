import { useNavigate, To } from "react-router";
import NullComponent from "@/atoms/NullComponent";

export type ValidSizes =
  | "none"
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl";

type ValidRounded =
  | true
  | "full"
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export interface ButtonProps {
  label?: React.ReactNode;
  labelSize?: ValidSizes;
  labelColor?: string;
  activeLabelColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSize?: ValidSizes;
  iconClasses?: string;
  outerLabel?: string;
  outerLabelSize?: ValidSizes;
  outerLabelColor?: string;
  borderClasses?: string;
  rounded?: ValidRounded;
  bgColor?: string;
  activeBgColor?: string;
  shadow?: ValidSizes;
  padding?: string;
  inverted?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  navigateTo?: To;
}

export default function Button({
  label = "",
  labelSize = "sm",
  labelColor = "neutral-600",
  activeLabelColor = "white",
  icon = NullComponent,
  iconSize = "2xl",
  iconClasses = "",
  outerLabel = "",
  outerLabelSize = "sm",
  outerLabelColor = "neutral-700",
  borderClasses = "border border-2 border-primary",
  rounded = "full",
  bgColor = "white",
  activeBgColor = "primary",
  shadow = "md",
  padding = "3",
  inverted = false,
  fullWidth = false,
  onClick = () => null,
  disabled = false,
  className = "",
  style = {},
  navigateTo = undefined,
}: ButtonProps) {
  const Icon = icon;
  // tailwindcss dynamic classes don't work here, the tokenizer needs to see the whole string, they're computed at build time, not runtime!
  const colors = `bg-${bgColor} text-${labelColor} ${disabled ? "" : `active:bg-${activeBgColor} active:text-${activeLabelColor}`}`;
  const invertedColors = `bg-${activeBgColor} text-${activeLabelColor} ${disabled ? "" : `active:bg-${bgColor} active:text-${labelColor}`}`;
  const colorClasses = inverted ? invertedColors : colors;

  const roundedClass = rounded === true ? "rounded" : `rounded-${rounded}`;
  const disabledClasses = disabled
    ? `opacity-[.5] shadow-none active:shadow-none`
    : "cursor-pointer";

  const navigate = useNavigate();

  const handleOnClick = (event) => {
    event.stopPropagation();
    onClick(event);

    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      <button
        type="button"
        onClick={handleOnClick}
        className={`
          flex items-center justify-center
          p-${padding} mx-auto
          ${fullWidth ? " w-full " : ""}
          ${borderClasses} 
          ${colorClasses}
          text-${labelSize}
          ${roundedClass}
          shadow-${shadow} opacity-90 
          active:shadow-none active:shadow-inner
          ${disabledClasses}
        `}
        disabled={disabled}
        style={style}
      >
        <Icon
          className={`text-${iconSize} ${label ? "mr-1" : ""} ${iconClasses}`}
        />
        <span>{label}</span>
      </button>
      {outerLabel && (
        <div
          className={`text-${outerLabelSize} text-${outerLabelColor} mt-1 select-none text-center`}
        >
          {outerLabel}
        </div>
      )}
    </div>
  );
}
