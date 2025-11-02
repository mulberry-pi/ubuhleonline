import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MapPin, Clock, DollarSign, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface ProviderProfile {
  id: string;
  name: string;
  avatar: string;
  bannerImage?: string;
  rating: number;
  reviewCount: number;
  location: string;
  bio: string;
  services: Service[];
  availability?: string[];
  portfolioImages?: string[];
  verified: boolean;
  city?: string;
  suburb?: string;
  priceRange?: string;
}

interface ProviderProfileModalProps {
  provider: ProviderProfile | null;
  onClose: () => void;
  onBook: () => void;
}

const ProviderProfileModal = ({ provider, onClose, onBook }: ProviderProfileModalProps) => {
  if (!provider) return null;

  return (
    <Dialog open={!!provider} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header Image */}
        <div className="relative h-64 w-full">
          <img
            src={provider.bannerImage || provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-start gap-4">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{provider.name}</h2>
                  {provider.verified && (
                    <Badge className="bg-primary text-white">✓ Verified</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                    <span className="text-white/80">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.location}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)] px-6">
          <div className="py-6 space-y-8">
            {/* About */}
            <section>
              <h3 className="text-xl font-semibold mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">{provider.bio}</p>
            </section>

            {/* Services */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Services & Pricing</h3>
              <div className="grid gap-3">
                {provider.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">R{service.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Availability */}
            {provider.availability && provider.availability.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.availability.map((day) => (
                    <Badge key={day} variant="secondary" className="px-4 py-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {day}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {provider.portfolioImages && provider.portfolioImages.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Portfolio</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {provider.portfolioImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-6 flex items-center justify-between bg-muted/30">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Starting from</p>
            <p className="text-2xl font-bold text-primary">
              {provider.priceRange || `R${Math.min(...provider.services.map(s => s.price))}`}
            </p>
          </div>
          <Button
            onClick={onBook}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full"
          >
            Book Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderProfileModal;
