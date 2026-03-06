import Overlay from "@/atoms/Overlay";
import Card from "@/atoms/Card";

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
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      <Card className={className}>{children}</Card>
    </Overlay>
  );
}
