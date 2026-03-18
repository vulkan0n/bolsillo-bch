import { useEffect, useRef, useState } from "react";

import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";

interface PinInputModalProps {
  isPasswordMode: boolean;
  onComplete: (pin: string) => void;
  onCancel: () => void;
}

type Step = "enter" | "confirm";

const MIN_PASSWORD_LENGTH = 8;

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

export default function PinInputModal({
  isPasswordMode,
  onComplete,
  onCancel,
}: PinInputModalProps) {
  const [step, setStep] = useState<Step>("enter");
  const [value, setValue] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    function focusInput() {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    },
    [step]
  );

  // ----------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value) return;

    if (step === "enter") {
      if (isPasswordMode && value.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        return;
      }
      setFirstValue(value);
      setValue("");
      setError("");
      setStep("confirm");
      return;
    }

    // step === "confirm"
    if (value !== firstValue) {
      setError("Values do not match. Please try again.");
      setValue("");
      return;
    }

    onComplete(value);
  };

  // ----------------
  const title = isPasswordMode ? "Password" : "PIN";
  const stepTitle =
    step === "enter" ? `Enter new ${title}` : `Confirm ${title}`;

  return (
    <Modal onClose={onCancel} className="max-w-sm mx-4">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {stepTitle}
        </h2>

        {step === "enter" && isPasswordMode && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Minimum {MIN_PASSWORD_LENGTH} characters
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode={isPasswordMode ? undefined : "numeric"}
            pattern={isPasswordMode ? undefined : "[0-9]*"}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            placeholder={
              step === "enter"
                ? `Enter ${title.toLowerCase()}`
                : `Confirm ${title.toLowerCase()}`
            }
            className="w-full p-3 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center text-xl tracking-widest"
          />

          {error && (
            <p className="text-sm text-error dark:text-error-light mb-2 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end mt-4">
            <Button {...cancelButtonProps} label="Cancel" onClick={onCancel} />
            <Button
              {...submitButtonProps}
              submit
              disabled={!value}
              label={step === "enter" ? "Next" : "Confirm"}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
