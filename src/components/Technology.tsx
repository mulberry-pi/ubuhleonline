import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import carousel1 from "@/assets/carousel-1.png";
import carousel2 from "@/assets/carousel-2.png";
import carousel3 from "@/assets/carousel-3.png";
import carousel4 from "@/assets/carousel-4.png";
import carouselComposite from "@/assets/carousel-composite.png";

const Technology = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: carousel1 },
    { image: carousel2 },
    { image: carousel3 },
    { image: carousel4 },
    { image: carouselComposite },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section id="technology" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Fast. Easy. <span className="text-primary">Reliable.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload a selfie and your style inspiration photo to see an AI-generated preview of
              your look before booking. Find the perfect stylist who can bring your vision to life.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 hover-glow" onClick={() => navigate('/search')}>
              Try It Out Now
            </Button>
          </div>

          <div className="relative fade-in-up animation-delay-200">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-card aspect-[4/3]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0"
                      : index < currentSlide
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`AI Style Preview ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevSlide}
                className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:bg-primary hover:text-white"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:bg-primary hover:text-white"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
