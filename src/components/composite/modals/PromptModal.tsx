import { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";
import {
  cancelButtonProps,
  confirmButtonProps,
} from "@/composite/modals/modalButtonStyles";

import common from "@/translations/common";
import { translate } from "@/util/translations";

interface PromptModalProps {
  title?: string;
  message?: string;
  inputType?: "text" | "password";
  inputMode?: "numeric" | "text";
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  pattern?: string;
  footerLink?: { label: string; onClick: () => void };
  /** Called when the cancel button is clicked (NOT when X/outside-tap dismisses) */
  cancelButtonClick?: () => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export default function PromptModal({
  title = undefined,
  message = undefined,
  inputType = "text",
  inputMode = "text",
  placeholder = undefined,
  submitLabel = translate(common.ok),
  cancelLabel = translate(common.cancel),
  pattern = undefined,
  footerLink = undefined,
  cancelButtonClick = undefined,
  onSubmit,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
  };

  return (
    <Modal className="max-w-sm mx-4">
      <div className="p-4">
        {title && (
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h2>
        )}

        {message && (
          <p className="text-neutral-800 dark:text-neutral-200 mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type={inputType === "password" && showInput ? "text" : inputType}
              autoFocus
              inputMode={inputMode}
              pattern={pattern}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center text-xl tracking-widest"
            />
            {inputType === "password" && (
              <button
                type="button"
                onClick={() => setShowInput((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                tabIndex={-1}
              >
                {showInput ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              {...confirmButtonProps}
              fullWidth
              submit
              disabled={!value.trim()}
              label={submitLabel}
            />
            <Button
              {...cancelButtonProps}
              fullWidth
              label={cancelLabel}
              onClick={() => {
                cancelButtonClick?.();
                onCancel();
              }}
            />
          </div>

          {footerLink && (
            <button
              type="button"
              className="w-full text-center text-sm text-primary-600 dark:text-primary-400 underline mt-3 cursor-pointer"
              onClick={() => {
                // Close modal first, then notify caller
                onCancel();
                footerLink.onClick();
              }}
            >
              {footerLink.label}
            </button>
          )}
        </form>
      </div>
    </Modal>
  );
}
