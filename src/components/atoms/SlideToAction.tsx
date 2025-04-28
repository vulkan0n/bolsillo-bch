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
  const knobRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);

  const offsetX = useRef<number>(0);

  const endX = useRef<number>(0);

  const didConfirm = useRef<boolean>(false);

  const stopDragging = () => {
    document.body.classList.remove("cursor-grabbing");
    isDragging.current = false;
    if (didConfirm.current) return;
    if (knobRef.current == null) return;
    if (bannerRef.current == null) return;
    knobRef.current.style.transform = `translateX(0)`;
    knobRef.current.style.transition = `0.1s`;
    bannerRef.current.style.width = `0`;
  };

  const startDragging = (x: number) => {
    if (knobRef.current == null) return;
    if (knobRef.current.parentElement == null) return;
    offsetX.current = x;
    endX.current =
      knobRef.current.parentElement.getBoundingClientRect().width -
      knobRef.current.getBoundingClientRect().width / 1.2;

    isDragging.current = true;
    document.body.classList.add("cursor-grabbing");
  };

  const handleConfirm = () => {
    didConfirm.current = true;
    stopDragging();
    onSlide();
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging.current) return;
    if (knobRef.current == null) return;
    if (bannerRef.current == null) return;

    const x = e.clientX;

    const transformX = Math.max(0, Math.min(endX.current, x - offsetX.current));
    if (transformX === endX.current) {
      handleConfirm();
    }
    const knobWidth = knobRef.current.getBoundingClientRect().width;
    knobRef.current.style.transition = `none`;
    knobRef.current.style.transform = `translateX(${transformX}px)`;
    bannerRef.current.style.transition = `none`;
    bannerRef.current.style.width = `${transformX + knobWidth}px`;
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    stopDragging();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.clientX);
  };

  return (
    <div className="bg-primary-200 border border-primary-200 shadow-inner rounded-full h-12 flex items-center relative">
      <div
        ref={bannerRef}
        className="h-14 w-0 bg-primary absolute rounded-full"
      />
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        ref={knobRef}
        className="h-16 w-16 relative z-10 flex items-center justify-center bg-primary p-0.5 rounded-full"
      >
        <SeleneLogo className="w-full h-full" />
      </div>
      <div className="text-lg font-bold text-neutral-600 flex-1 text-center mr-4 ml-auto">
        {label}
      </div>
    </div>
  );
}

/*
 *
    <div className="p-1 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className={clsx(
          className,
          "bg-neutral-100 rounded-full flex items-center relative text-primary font-bold text-center",
          {
            "opacity-50 pointer-events-none": disabled,
          }
        )}
      >
        <div className="h-10 leading-10">{label}</div>
      </div>
    </div>
  */
