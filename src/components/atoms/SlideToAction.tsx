import clsx from "clsx";
import React, { useRef } from "react";
import SeleneLogo from "./SeleneLogo";

interface Props {
  onSlide: () => void;
  className: string | undefined;
  disabled: boolean | undefined;
  label: string;
}

export default function SlideToAction({
  className,
  onSlide,
  disabled,
  label,
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
      stopDragging(); // eslint-disable-line
      onSlide();
    }
    ref.current.style.transition = `none`;
    ref.current.style.transform = `translateX(${transformX}px)`;
  };

  const mouseDragElement = (e: MouseEvent) => {
    e.preventDefault();
    dragElement(e.clientX);
  };

  const touchDragElement = (e: TouchEvent) => {
    e.preventDefault();
    dragElement(e.touches[0].clientX);
  };

  const stopDragging = () => {
    if (ref.current == null) return;
    document.removeEventListener("mousemove", mouseDragElement);
    document.removeEventListener("touchmove", touchDragElement);
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
    document.addEventListener("mousemove", mouseDragElement);
    document.addEventListener("touchmove", touchDragElement);

    document.body.classList.add("cursor-grabbing");
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.touches[0].clientX);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
          onTouchStart={onTouchStart}
          onTouchEnd={stopDragging}
          onMouseDown={onMouseDown}
          onMouseUp={stopDragging}
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
