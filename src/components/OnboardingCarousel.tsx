import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  emoji: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    emoji: "🥗",
    title: "Track Your Food",
    description: "Keep track of everything in your fridge, freezer, and pantry. Never forget what you have!"
  },
  {
    emoji: "🗓️",
    title: "Never Waste Again",
    description: "Get alerts before items expire. Save money and reduce food waste effortlessly."
  },
  {
    emoji: "🛒",
    title: "Smart Shopping Lists",
    description: "Automatically generate shopping lists based on what's running low or expiring soon."
  }
];

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      previousSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      {!isLastSlide && (
        <div className="absolute top-6 right-6 z-10">
          <Button variant="ghost" size="sm" onClick={onComplete}>
            Skip
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Emoji */}
        <div className="text-9xl mb-8 animate-bounce">
          {slides[currentSlide].emoji}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          {slides[currentSlide].title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="pb-12 px-8">
        {/* Page Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {/* Back Button (only show if not on first slide) */}
          {currentSlide > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={previousSlide}
              className="flex-1"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}

          {/* Next/Get Started Button */}
          <Button
            size="lg"
            onClick={nextSlide}
            className={`${currentSlide === 0 ? 'w-full' : 'flex-1'}`}
          >
            {isLastSlide ? (
              'Get Started'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

