import { CloseOutlined } from "@ant-design/icons";

import Card from "@/atoms/Card";
import Overlay from "@/atoms/Overlay";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Modal({
  children,
  onClose = undefined,
  className = "",
}: ModalProps) {
  return (
    <Overlay className="items-center justify-center" onClose={onClose}>
      <Card className={`pointer-events-auto p-2 ${className}`}>{children}</Card>
      {onClose && (
        <button
          type="button"
          className="pointer-events-auto absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-900/50 text-white cursor-pointer"
          onClick={onClose}
        >
          <CloseOutlined />
        </button>
      )}
    </Overlay>
  );
}
