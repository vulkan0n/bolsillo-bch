import Overlay from "@/atoms/Overlay";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export default function Modal({
  children,
  onClose,
  className = "",
}: ModalProps) {
  return (
    <Overlay className="items-center justify-center">
      {/* Backdrop - tap to close */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div
        className={`relative z-10 flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl ${className}`}
      >
        {children}
      </div>
    </Overlay>
  );
}
