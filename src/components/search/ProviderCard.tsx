import { Provider } from '@/types/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderCardProps {
  provider: Provider;
  viewMode: 'grid' | 'list';
  onViewProfile?: (provider: Provider) => void;
}

const ProviderCard = ({ provider, viewMode, onViewProfile }: ProviderCardProps) => {
  const navigate = useNavigate();

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/booking?provider=${provider.id}`);
  };

  const handleCardClick = () => {
    if (onViewProfile) {
      onViewProfile(provider);
    }
  };
  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-card rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-2 flex gap-6 border border-border/50 cursor-pointer"
      >
        <div className="relative w-56 flex-shrink-0">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          {provider.verified && (
            <Badge className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 text-xs font-semibold shadow-lg">
              ✓ Verified
            </Badge>
          )}
        </div>
        <div className="flex-1 py-6 pr-6 flex flex-col">
          <h3 className="text-xl font-bold mb-3 text-foreground">{provider.name}</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                {provider.rating.toFixed(1)}
              </span>
            </div>
            {provider.distance && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                <span>{provider.distance} km away</span>
              </div>
            )}
            {provider.city && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                <span>{provider.city}{provider.suburb ? `, ${provider.suburb}` : ''}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {provider.services.slice(0, 4).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs px-3 py-1 bg-accent/50">
                {service}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto pt-4 border-t">
            <span className="text-base font-bold text-primary">
              R{provider.price_min} - R{provider.price_max}
            </span>
            <Button onClick={handleBookNow} className="bg-primary hover:bg-primary/90 text-white h-10 px-8 rounded-full shadow-md hover:shadow-lg transition-all">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-card rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-2 border border-border/50 cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={provider.avatar}
          alt={provider.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {provider.verified && (
          <Badge className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 text-xs font-semibold shadow-lg">
            ✓ Verified
          </Badge>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
          {provider.name}
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
              {provider.rating.toFixed(1)}
            </span>
          </div>
          {provider.distance && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{provider.distance} km</span>
            </div>
          )}
          {provider.city && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{provider.city}{provider.suburb ? `, ${provider.suburb}` : ''}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {provider.services.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs px-2.5 py-0.5 bg-accent/50">
              {service}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm font-bold text-primary">
            R{provider.price_min} - R{provider.price_max}
          </span>
          <Button onClick={handleBookNow} className="bg-primary hover:bg-primary/90 text-white h-9 px-6 rounded-full shadow-md hover:shadow-lg transition-all">
            Book
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
