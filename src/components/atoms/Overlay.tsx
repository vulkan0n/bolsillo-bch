import { createPortal } from "react-dom";

import FullColumn from "@/layout/FullColumn";

export default function Overlay({
  children,
  className = "",
  transparent = false,
}) {
  const rootNode = document.querySelector("#container")!;

  const bgClass = transparent ? "bg-transparent" : "bg-neutral-1000/50";

  return createPortal(
    <div className={`absolute top-0 left-0 w-full h-full z-50 ${bgClass}`}>
      <FullColumn className={className}>{children}</FullColumn>
    </div>,
    rootNode
  );
}
