type ValidSizes =
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

export interface ButtonProps {
  label?: string;
  labelSize?: ValidSizes;
  icon?: React.ComponentType;
  iconSize?: ValidSizes;
  outerLabel?: string;
  outerLabelSize?: ValidSizes;
  outerLabelColor?: string;
  borderClasses?: string;
  inverted?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler;
}

export default function Button({
  label = "",
  labelSize = "sm",
  icon = () => null,
  iconSize = "2xl",
  outerLabel = "",
  outerLabelSize = "sm",
  outerLabelColor = "zinc-700",
  borderClasses = "border border-2 border-primary rounded-full",
  inverted = false,
  fullWidth = false,
  onClick = () => null,
}: ButtonProps) {
  const Icon = icon;
  const inactiveClasses =
    "bg-white text-zinc-600 active:bg-primary active:text-white";
  const activeClasses =
    "bg-primary text-white active:bg-white active:text-zinc-600";
  const colorClasses = inverted ? activeClasses : inactiveClasses;

  return (
    <div className={`cursor-pointer ${fullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={`
          flex items-center justify-center
          p-3 mx-auto
          ${fullWidth ? " w-full " : ""}
          ${borderClasses} 
          ${colorClasses}
          text-${labelSize}
          shadow-md opacity-90 
          active:shadow-none active:shadow-inner
        `}
      >
        <Icon className={`text-${iconSize} ${label ? "mr-1" : ""}`} />
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
