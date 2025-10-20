import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ResultComparisonProps {
  originalImage: string;
  generatedImage: string;
  onReset: () => void;
}

const ResultComparison = ({
  originalImage,
  generatedImage,
  onReset,
}: ResultComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Success Message */}
      <div className="text-center">
        <h2 
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your style preview is <span className="text-primary">ready!</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Drag the slider to compare your original photo with the AI-generated preview
        </p>
      </div>

      {/* Image Comparison */}
      <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border/50">
        <div
          className="relative aspect-[3/4] max-w-2xl mx-auto rounded-xl overflow-hidden cursor-ew-resize"
          onMouseMove={handleMouseMove}
        >
          {/* Generated Image (Background) */}
          <img
            src={generatedImage}
            alt="Generated Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Original Image (Overlay) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={originalImage}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-foreground/40 rounded-full" />
                <div className="w-1 h-4 bg-foreground/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            Your Selfie
          </div>
          <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            Style Preview
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/20">
        <h3 className="text-2xl font-bold mb-3">
          Matched with stylists who specialize in this look
        </h3>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Browse verified beauty professionals near you who can bring this style to life
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/booking")}
            size="lg"
            className="hover-glow px-8"
          >
            Find My Stylist
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
          >
            <RotateCcw className="mr-2 w-5 h-5" />
            Try Another Look
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultComparison;
