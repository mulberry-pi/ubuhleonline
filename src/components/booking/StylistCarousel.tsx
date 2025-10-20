import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stylist } from "@/types/booking";
import { Badge } from "@/components/ui/badge";

interface StylistCarouselProps {
  stylists: Stylist[];
  onStylistSelect: (stylist: Stylist) => void;
}

const StylistCarousel = ({ stylists, onStylistSelect }: StylistCarouselProps) => {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stylists.map((stylist) => (
          <div
            key={stylist.id}
            className="bg-card rounded-2xl overflow-hidden shadow-elegant border border-border/50 hover:shadow-[0_20px_60px_-10px_rgba(201,179,246,0.3)] transition-all duration-300 group"
          >
            {/* Profile Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={stylist.avatar}
                alt={stylist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {stylist.verified && (
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{stylist.name}</h3>
                <p className="text-muted-foreground text-sm">{stylist.businessName}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{stylist.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({stylist.reviewCount} reviews)</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{stylist.location}</span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2">
                {stylist.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => onStylistSelect(stylist)}
                className="w-full hover-glow"
                size="lg"
              >
                View Profile →
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StylistCarousel;
