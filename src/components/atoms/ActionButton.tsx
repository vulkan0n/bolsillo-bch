import { ReactNode } from "react";

export interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  ariaLabel = undefined,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className="flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
    >
      <span className="w-14 h-14 rounded-full bg-neutral-0 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-50 active:bg-neutral-100 dark:active:bg-neutral-700 active:scale-[0.98] transition-all duration-100">
        {icon}
      </span>
      <span className="text-sm text-neutral-700 dark:text-neutral-100">
        {label}
      </span>
    </button>
  );
}
