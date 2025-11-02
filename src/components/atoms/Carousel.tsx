/* eslint-disable react/no-array-index-key */
import { useState, useEffect, Children } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Button from "@/atoms/Button";

interface CarouselProps {
  children: React.ReactNode;
  autoRotateInterval?: number;
}

export default function Carousel({
  children,
  autoRotateInterval = 10000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Convert children to array and filter out null, undefined, or falsy children
  const validChildren = Children.toArray(children).filter((child) => !!child);

  // Auto-rotation effect - only if more than 1 child
  useEffect(() => {
    if (isPaused || validChildren.length <= 1) {
      return () => {};
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validChildren.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [validChildren.length, autoRotateInterval, currentIndex, isPaused]);

  const handleCardInteraction = () => {
    setIsPaused(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? validChildren.length - 1 : prevIndex - 1
    );
    setIsPaused(true); // Reset pause state on manual navigation
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % validChildren.length);
    setIsPaused(true); // Reset pause state on manual navigation
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true); // Reset pause state on manual navigation
  };

  // Don't show navigation controls if there's only 0 or 1 child
  const shouldShowNavigation = validChildren.length > 1;

  // If no valid children, return nothing
  if (validChildren.length === 0) {
    return null;
  }

  // If only one child, display it without rotation controls
  if (validChildren.length === 1) {
    return (
      <div className="overflow-hidden max-h-100 rounded-lg border border-primary dark:border-primarydark-200 shadow-sm">
        {validChildren[0]}
      </div>
    );
  }

  return (
    <div className="" onClick={handleCardInteraction}>
      <div className="overflow-hidden max-h-100 rounded-lg border border-primary dark:border-primarydark-200 shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validChildren.map((child) => {
            return (
              <div key={child!.key} className="w-full shrink-0 max-h-full">
                {child}
              </div>
            );
          })}
        </div>
      </div>

      {shouldShowNavigation && (
        <div className="w-1/2 mx-auto py-1 px-8 bg-primary-300 border border-primary border-t-0 dark:border-primarydark-200 dark:bg-primarydark-100 rounded-b shadow-sm dark:shadow-none flex items-center justify-between gap-4">
          <Button
            icon={LeftOutlined}
            iconSize="lg"
            padding="1"
            onClick={goToPrevious}
          />

          <div className="flex gap-3">
            {validChildren.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : "bg-neutral-500"}`}
              />
            ))}
          </div>

          <Button
            icon={RightOutlined}
            iconSize="lg"
            padding="1"
            onClick={goToNext}
          />
        </div>
      )}
    </div>
  );
}
