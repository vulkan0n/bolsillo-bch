import { useEffect, useRef, useState } from "react";

import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";

interface PromptModalProps {
  title?: string;
  message?: string;
  inputType?: "text" | "password";
  inputMode?: "numeric" | "text";
  placeholder?: string;
  submitLabel?: string;
  pattern?: string;
  onSubmit: (value: string) => void;
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

const submitButtonProps = {
  bgColor: "bg-primary-500 hover:bg-primary-700",
  activeBgColor: "bg-primary-700",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
  borderClasses: "",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

export default function PromptModal({
  title = undefined,
  message = undefined,
  inputType = "text",
  inputMode = "text",
  placeholder = undefined,
  submitLabel = "OK",
  pattern = undefined,
  onSubmit,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(function focusInput() {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <Modal onClose={onCancel} className="max-w-sm mx-4">
      <div className="p-4">
        {title && (
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h2>
        )}

        {message && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type={inputType}
            inputMode={inputMode === "numeric" ? "numeric" : undefined}
            pattern={pattern}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 mb-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center text-xl tracking-widest"
          />

          <div className="flex gap-3 justify-end">
            <Button {...cancelButtonProps} label="Cancel" onClick={onCancel} />
            <Button {...submitButtonProps} submit label={submitLabel} />
          </div>
        </form>
      </div>
    </Modal>
  );
}
