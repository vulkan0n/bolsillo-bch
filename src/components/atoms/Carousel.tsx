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
  const validChildren = Children.toArray(children).filter(
    (child) => child !== null && child !== undefined
  );

  // Auto-rotation effect - only if more than 1 child
  useEffect(() => {
    if (isPaused || validChildren.length <= 1) {
      return () => { };
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
  const showNavigation = validChildren.length > 1;

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
          {validChildren.map((child, index) => (
            <div key={index} className="w-full shrink-0 max-h-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {showNavigation && (
        <div className="w-full pt-1">
          <div className="flex items-center justify-center gap-4">
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
        </div>
      )}
    </div>
  );
}
