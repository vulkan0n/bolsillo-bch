import { ReactNode, useCallback, useRef, useState } from "react";

import ConfirmModal from "@/composite/ConfirmModal";
import PinInputModal from "@/composite/PinInputModal";
import PromptModal from "@/composite/PromptModal";

// --------------------------------
// Types

interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  showCancel?: boolean;
}

interface PromptOptions {
  title?: string;
  message?: string;
  inputType?: "text" | "password";
  inputMode?: "numeric" | "text";
  placeholder?: string;
  submitLabel?: string;
  pattern?: string;
}

interface PinInputOptions {
  isPasswordMode: boolean;
}

type ModalEntry =
  | { type: "confirm"; options: ConfirmOptions; resolve: (v: boolean) => void }
  | {
      type: "prompt";
      options: PromptOptions;
      resolve: (v: string | null) => void;
    }
  | {
      type: "pin";
      options: PinInputOptions;
      resolve: (v: string | null) => void;
    };

// --------------------------------
// Module-level ref to the provider's push function

let pushModal: ((entry: ModalEntry) => void) | null = null;

// --------------------------------
// Service API — callable from anywhere

export default function ModalService() {
  return {
    showConfirm(options: ConfirmOptions): Promise<boolean> {
      if (!pushModal) {
        throw new Error("ModalProvider not mounted");
      }
      return new Promise((resolve) => {
        pushModal!({ type: "confirm", options, resolve });
      });
    },

    showPrompt(options: PromptOptions): Promise<string | null> {
      if (!pushModal) {
        throw new Error("ModalProvider not mounted");
      }
      return new Promise((resolve) => {
        pushModal!({ type: "prompt", options, resolve });
      });
    },

    showPinInput(options: PinInputOptions): Promise<string | null> {
      if (!pushModal) {
        throw new Error("ModalProvider not mounted");
      }
      return new Promise((resolve) => {
        pushModal!({ type: "pin", options, resolve });
      });
    },
  };
}

// --------------------------------
// React provider — mount once at app root

export function ModalProvider() {
  const [modals, setModals] = useState<ModalEntry[]>([]);
  const modalsRef = useRef<ModalEntry[]>([]);

  const push = useCallback(function push(entry: ModalEntry) {
    modalsRef.current = [...modalsRef.current, entry];
    setModals(modalsRef.current);
  }, []);

  const dismiss = useCallback(function dismiss(index: number) {
    modalsRef.current = modalsRef.current.filter((_, i) => i !== index);
    setModals(modalsRef.current);
  }, []);

  // Register the push function so the imperative API can use it
  pushModal = push;

  // Only render the topmost modal (stack support — last in, first out)
  const current = modals.length > 0 ? modals[modals.length - 1] : null;
  const currentIndex = modals.length - 1;

  if (!current) return null;

  switch (current.type) {
    case "confirm":
      return (
        <ConfirmModal
          {...current.options}
          onConfirm={() => {
            dismiss(currentIndex);
            current.resolve(true);
          }}
          onCancel={() => {
            dismiss(currentIndex);
            current.resolve(false);
          }}
        />
      );

    case "prompt":
      return (
        <PromptModal
          {...current.options}
          onSubmit={(value) => {
            dismiss(currentIndex);
            current.resolve(value);
          }}
          onCancel={() => {
            dismiss(currentIndex);
            current.resolve(null);
          }}
        />
      );

    case "pin":
      return (
        <PinInputModal
          isPasswordMode={current.options.isPasswordMode}
          onComplete={(pin) => {
            dismiss(currentIndex);
            current.resolve(pin);
          }}
          onCancel={() => {
            dismiss(currentIndex);
            current.resolve(null);
          }}
        />
      );

    default:
      return null;
  }
}
