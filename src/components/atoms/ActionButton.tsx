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
      <span className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900 border-[1.5px] border-brand-300 dark:border-brand-700 flex items-center justify-center text-brand-700 dark:text-brand-200 active:bg-brand-100 dark:active:bg-brand-800 active:scale-[0.98] transition-all duration-100">
        {icon}
      </span>
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
    </button>
  );
}
