import { Loader2 } from "lucide-react";

// --------------------------------

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type AppButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  /**
   * Clases adicionales aplicadas al <button>.
   * Solo para clases que no existen en variant/size;
   * no resuelve conflictos de Tailwind hasta que se instale tailwind-merge.
   */
  className?: string;
  "aria-label"?: string;
}

// --------------------------------

const VARIANT_CLASSES: Record<AppButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600",
  secondary:
    "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-200 dark:text-neutral-800",
  outline:
    "bg-transparent text-neutral-800 border border-neutral-300 hover:bg-neutral-50 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-800",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
  destructive: "bg-error text-white hover:bg-error-dark",
};

const SIZE_CLASSES: Record<AppButtonSize, string> = {
  sm: "h-9 px-3 rounded-md text-sm",
  md: "h-12 px-5 rounded-xl text-body-md",
  lg: "h-14 px-6 rounded-xl text-body-md",
};

const SPINNER_SIZE: Record<AppButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

// --------------------------------

export default function AppButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick = () => {},
  type = "button",
  className = "",
  "aria-label": ariaLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type === "submit" ? "submit" : "button"}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`flex items-center justify-center gap-2 font-medium
        active:scale-[0.98] transition-all duration-150
        focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2
        ${fullWidth ? "w-full" : ""}
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
    >
      {loading && (
        <Loader2
          size={SPINNER_SIZE[size]}
          className="animate-spin flex-shrink-0"
        />
      )}
      {children}
    </button>
  );
}
