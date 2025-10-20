import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const ProcessingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Analyzing your facial features...",
    "Matching style inspiration...",
    "Applying texture and color...",
    "Refining details...",
    "Finalizing your preview...",
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="bg-card rounded-2xl p-12 shadow-elegant border border-border/50 text-center max-w-2xl mx-auto">
      {/* Animated Circle */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 animate-float" />
        </div>
        
        {/* Spinning ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }}>
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="80 140"
            opacity="0.6"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
        Generating your preview…
      </h2>
      
      <p className="text-muted-foreground mb-6">
        Ubuhle's AI is analyzing your look and style inspiration.
      </p>

      {/* Progress Bar */}
      <Progress value={progress} className="mb-6" />

      {/* Step Indicator */}
      <div className="h-6 overflow-hidden">
        <p 
          className="text-sm text-primary font-medium animate-fade-in-up"
          key={stepIndex}
        >
          {steps[stepIndex]}
        </p>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
