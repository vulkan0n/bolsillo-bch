import { LoadingOutlined } from "@ant-design/icons";

interface LoadingToastProps {
  message: string;
  onDismiss: () => void;
}

export default function LoadingToast({
  message,
  onDismiss,
}: LoadingToastProps) {
  return (
    <div
      className="opacity-95 w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg flex items-center border-2 border-primary dark:border-primarydark-400 p-3 gap-3 cursor-pointer"
      onClick={onDismiss}
    >
      <LoadingOutlined className="text-2xl text-primary animate-spin" />
      <span className="text-neutral-800 dark:text-neutral-100 font-medium">
        {message}
      </span>
    </div>
  );
}
