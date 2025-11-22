import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Budget App",
      description: "Take control of your finances with smart budgeting designed for Rwandans",
      image: "https://images.unsplash.com/photo-1758686254415-9348b5b5df01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBwbGFubmluZyUyMGJ1ZGdldHxlbnwxfHx8fDE3NjM2NDQzMjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Track Your Expenses",
      description: "Monitor your spending in Rwandan Francs and stay on top of your budget goals",
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXZpbmdzJTIwbW9uZXklMjBncm93dGh8ZW58MXx8fHwxNzYzNzE5MDIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "AI-Powered Insights",
      description: "Get personalized financial advice and smart recommendations to save more",
      image: "https://images.unsplash.com/photo-1649486116188-b464d7f864a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYW5raW5nJTIwYWZyaWNhfGVufDF8fHx8MTc2MzcxOTAyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Image Section */}
      <div className="flex-1 relative">
        <ImageWithFallback
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="px-6 pb-8 pt-4 md:px-12 md:pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <h1 className="mb-4 text-center">{slides[currentSlide].title}</h1>
          <p className="text-center text-muted-foreground mb-8">
            {slides[currentSlide].description}
          </p>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={currentSlide === 0 ? "w-full" : "flex-1"}
            >
              {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              {currentSlide < slides.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>

          {currentSlide < slides.length - 1 && (
            <Button
              variant="ghost"
              onClick={onComplete}
              className="w-full mt-4"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
