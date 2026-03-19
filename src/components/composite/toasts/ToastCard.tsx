import { ReactNode } from "react";

interface ToastCardProps {
  icon: ReactNode;
  header: ReactNode;
  body?: ReactNode;
  onDismiss: () => void;
}

export default function ToastCard({
  icon,
  header,
  body = undefined,
  onDismiss,
}: ToastCardProps) {
  return (
    <div
      className="opacity-95 w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg flex border-2 border-primary dark:border-primarydark-400 p-2 cursor-pointer"
      onClick={onDismiss}
    >
      <div className="my-auto p-2">
        <div className="flex items-center justify-center">{icon}</div>
      </div>
      <div className="p-1 break-words">
        <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
          {header}
        </div>
        {body && (
          <div className="text-base text-neutral-700 dark:text-neutral-200 flex">
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
