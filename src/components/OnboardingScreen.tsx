import { useState } from "react";
import { Button } from "./ui/button";
import { Camera, Bell, Users, ChevronRight } from "lucide-react";
import { Progress } from "./ui/progress";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Camera,
      title: "Scan Receipts Instantly",
      description: "Simply scan your grocery receipts and we'll automatically add items to your inventory. No more manual entry!",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Bell,
      title: "Never Waste Food Again",
      description: "Get smart alerts before items expire. We'll notify you with plenty of time to use or freeze your groceries.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Users,
      title: "Share with Your Household",
      description: "Collaborate on shopping lists in real-time. Everyone stays in sync about what's needed and what's in stock.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;
  const progress = ((currentSlide + 1) / slides.length) * 100;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
      {/* Skip Button */}
      <div className="flex justify-end mb-8">
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className={`w-32 h-32 rounded-3xl ${currentSlideData.bgColor} flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-500`}>
          <Icon className={`w-16 h-16 ${currentSlideData.color}`} />
        </div>

        {/* Title */}
        <h1 className="text-3xl text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentSlideData.title}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {currentSlideData.description}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-6 max-w-md mx-auto w-full">
        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary w-6' : 'bg-muted'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Next Button */}
        <Button onClick={handleNext} size="lg" className="w-full">
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
}
