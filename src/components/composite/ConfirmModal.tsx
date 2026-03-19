import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";

import common from "@/translations/common";
import { translate } from "@/util/translations";

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
  labelColor: "text-neutral-800 dark:text-neutral-100 font-medium",
  activeLabelColor: "text-neutral-900 dark:text-neutral-50",
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
  confirmLabel = translate(common.ok),
  cancelLabel = translate(common.cancel),
  isDanger = false,
  showCancel = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal className="max-w-sm mx-4">
      <div className="p-4">
        {title && (
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h2>
        )}

        <div className="text-neutral-800 dark:text-neutral-200 mb-6 whitespace-pre-line break-words">
          {message}
        </div>

        <div className="flex gap-3">
          <Button
            {...(isDanger ? dangerButtonProps : confirmButtonProps)}
            fullWidth
            label={confirmLabel}
            onClick={onConfirm}
          />
          {showCancel && (
            <Button
              {...cancelButtonProps}
              fullWidth
              label={cancelLabel}
              onClick={onCancel}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
