import { ReactNode, useCallback, useRef, useState } from "react";

import ConfirmModal from "@/composite/modals/ConfirmModal";
import PromptModal from "@/composite/modals/PromptModal";

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

type ModalEntry =
  | { type: "confirm"; options: ConfirmOptions; resolve: (v: boolean) => void }
  | {
      type: "prompt";
      options: PromptOptions;
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
        pushModal({ type: "confirm", options, resolve });
      });
    },

    showPrompt(options: PromptOptions): Promise<string | null> {
      if (!pushModal) {
        throw new Error("ModalProvider not mounted");
      }
      return new Promise((resolve) => {
        pushModal({ type: "prompt", options, resolve });
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

  pushModal = push;

  // FIFO: first pushed = first shown, dismiss reveals next in queue
  const current = modals.length > 0 ? modals[0] : null;

  if (!current) return null;

  switch (current.type) {
    case "confirm":
      return (
        <ConfirmModal
          {...current.options}
          onConfirm={() => {
            dismiss(0);
            current.resolve(true);
          }}
          onCancel={() => {
            dismiss(0);
            current.resolve(false);
          }}
        />
      );

    case "prompt":
      return (
        <PromptModal
          {...current.options}
          onSubmit={(value) => {
            dismiss(0);
            current.resolve(value);
          }}
          onCancel={() => {
            dismiss(0);
            current.resolve(null);
          }}
        />
      );

    default:
      return null;
  }
}
