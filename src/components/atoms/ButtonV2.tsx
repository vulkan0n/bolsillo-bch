export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonV2Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600",
  secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  outline:
    "bg-transparent border border-neutral-300 text-neutral-800 hover:bg-neutral-50",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  destructive: "bg-error text-white hover:bg-error-dark",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-12 px-5 text-body-md rounded-xl",
  lg: "h-14 px-6 text-body-md rounded-xl",
};

export default function ButtonV2({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick = undefined,
  className = "",
  children,
}: ButtonV2Props) {
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-150 ease-out",
        "active:scale-[0.98]",
        "focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
