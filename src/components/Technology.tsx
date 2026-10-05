import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import matchPreview1 from "@/assets/match-preview-1.png";
import matchPreview2 from "@/assets/match-preview-2.png";
import matchPreview3 from "@/assets/match-preview-3.png";
import matchPreview4 from "@/assets/match-preview-4.png";
import matchPreview5 from "@/assets/match-preview-5.png";

const Technology = () => {
  const navigate = useNavigate();
  
  const carouselImages = [
    { src: matchPreview1, alt: "Hair styling transformation example 1" },
    { src: matchPreview2, alt: "Lash extension transformation example" },
    { src: matchPreview3, alt: "Hair styling transformation example 2" },
    { src: matchPreview4, alt: "Natural hair styling transformation" },
    { src: matchPreview5, alt: "Men's haircut transformation" },
  ];

  return (
    <section id="technology" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Fast. Easy. <span className="text-primary">Reliable.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload your style inspiration and let our AI match you with the perfect stylist 
              who specializes in your desired look. Get personalized recommendations based on 
              style compatibility, ratings, and location.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 hover-glow" onClick={() => navigate('/search')}>
              Try It Out Now
            </Button>
          </div>

          <div className="relative fade-in-up animation-delay-200">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-card">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
