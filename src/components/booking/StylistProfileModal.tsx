import { X, Star, MapPin, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stylist } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface StylistProfileModalProps {
  stylist: Stylist;
  onClose: () => void;
  onBook: () => void;
}

const StylistProfileModal = ({ stylist, onClose, onBook }: StylistProfileModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % stylist.portfolioImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? stylist.portfolioImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Banner */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={stylist.bannerImage}
            alt={stylist.businessName}
            className="w-full h-full object-cover"
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </Button>
          {stylist.verified && (
            <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Verified Professional
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {stylist.name}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">{stylist.businessName}</p>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{stylist.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({stylist.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{stylist.location}</span>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed">{stylist.bio}</p>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {stylist.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="px-4 py-2">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Portfolio</h3>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={stylist.portfolioImages[currentImageIndex]}
                alt={`Portfolio ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {stylist.portfolioImages.length > 1 && (
                <>
                  <Button
                    onClick={prevImage}
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {stylist.portfolioImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Services & Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Services & Pricing</h3>
            <div className="space-y-3">
              {stylist.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50"
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                  </div>
                  <p className="text-lg font-bold text-primary">R{service.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Book Button */}
          <Button
            onClick={onBook}
            size="lg"
            className="w-full hover-glow text-lg h-14"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StylistProfileModal;
