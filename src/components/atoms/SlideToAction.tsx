import clsx from "clsx";
import React, { useRef } from "react";
import SeleneLogo from "./SeleneLogo";

interface Props {
  label: string;
  onSlide: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SlideToAction({
  label,
  onSlide,
  disabled = false,
  className = undefined,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const offsetX = useRef<number>(0);

  const endX = useRef<number>(0);

  const didConfirm = useRef<boolean>(false);

  const dragElement = (x: number) => {
    if (ref.current == null) return;
    const transformX = Math.max(0, Math.min(endX.current, x - offsetX.current));
    if (transformX === endX.current) {
      didConfirm.current = true;
      stopDragging();
      onSlide();
    }
    ref.current.style.transition = `none`;
    ref.current.style.transform = `translateX(${transformX}px)`;
  };

  const pointerDragElement = (e: PointerEvent) => {
    e.preventDefault();
    dragElement(e.clientX);
  };

  const stopDragging = () => {
    if (ref.current == null) return;
    document.removeEventListener("pointermove", pointerDragElement);
    document.body.classList.remove("cursor-grabbing");
    if (didConfirm.current) return;
    ref.current.style.transform = `translateX(0)`;
    ref.current.style.transition = `0.1s`;
  };

  const startDragging = (x: number) => {
    if (ref.current == null) return;
    if (ref.current.parentElement == null) return;
    offsetX.current = x;
    endX.current =
      ref.current.parentElement.getBoundingClientRect().width -
      ref.current.getBoundingClientRect().width;
    document.addEventListener("pointermove", pointerDragElement);

    document.body.classList.add("cursor-grabbing");
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.clientX);
  };

  return (
    <div className="p-1 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className={clsx(
          className,
          "bg-neutral-100 rounded-full flex items-center justify-center relative text-primary font-bold text-center",
          {
            "opacity-50 pointer-events-none": disabled,
          }
        )}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerUp={stopDragging}
          ref={ref}
          className="h-10 absolute left-0"
        >
          <div className="w-screen h-12 bg-primary absolute rounded-full -right-1 -top-1" />
          <SeleneLogo className="h-10 relative z-10" />
        </div>
        <div className="h-10 leading-10">{label}</div>
      </div>
    </div>
  );
}
