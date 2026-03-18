import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";

interface ConfirmModalProps {
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const cancelButtonProps = {
  bgColor: "bg-neutral-200 dark:bg-neutral-700",
  activeBgColor: "bg-neutral-300 dark:bg-neutral-600",
  labelColor: "text-neutral-600 dark:text-neutral-300 font-medium",
  activeLabelColor: "text-neutral-700 dark:text-neutral-200",
  borderClasses: "",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

const confirmButtonProps = {
  bgColor: "bg-primary-500 hover:bg-primary-700",
  activeBgColor: "bg-primary-700",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
  borderClasses: "",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

const dangerButtonProps = {
  bgColor: "bg-error hover:bg-error-dark",
  activeBgColor: "bg-error-dark",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
  borderClasses: "",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

export default function ConfirmModal({
  title = undefined,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  isDanger = false,
  showCancel = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} className="max-w-sm mx-4">
      <div className="p-4">
        {title && (
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h2>
        )}

        <div className="text-sm text-neutral-700 dark:text-neutral-300 mb-6 whitespace-pre-line break-words">
          {message}
        </div>

        <div
          className={`flex gap-3 ${showCancel ? "justify-end" : "justify-center"}`}
        >
          {showCancel && (
            <Button
              {...cancelButtonProps}
              label={cancelLabel}
              onClick={onCancel}
            />
          )}
          <Button
            {...(isDanger ? dangerButtonProps : confirmButtonProps)}
            label={confirmLabel}
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  );
}
