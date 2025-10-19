import { Provider } from '@/types/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
  viewMode: 'grid' | 'list';
}

const ProviderCard = ({ provider, viewMode }: ProviderCardProps) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_12px_-2px_hsl(266_60%_70%/0.12)] hover:shadow-[0_8px_30px_-4px_hsl(266_60%_70%/0.25)] transition-all duration-300 hover:-translate-y-1 flex gap-4">
        <div className="relative w-48 flex-shrink-0">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          {provider.verified && (
            <Badge className="absolute top-3 left-3 bg-primary text-white w-20 h-7 flex items-center justify-center text-xs">
              Verified
            </Badge>
          )}
        </div>
        <div className="flex-1 py-4 pr-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-sm">{provider.rating.toFixed(1)}</span>
            </div>
            {provider.distance && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{provider.distance} km</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.services.slice(0, 3).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-sm font-medium">
              R{provider.price_min} - R{provider.price_max}
            </span>
            <Button className="bg-primary hover:bg-primary/90 text-white h-9 px-6">
              Book
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_12px_-2px_hsl(266_60%_70%/0.12)] hover:shadow-[0_8px_30px_-4px_hsl(266_60%_70%/0.25)] transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-[200px]">
        <img
          src={provider.avatar}
          alt={provider.name}
          className="w-full h-full object-cover"
        />
        {provider.verified && (
          <Badge className="absolute top-3 left-3 bg-primary text-white w-20 h-7 flex items-center justify-center text-xs">
            Verified
          </Badge>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-sm">{provider.rating.toFixed(1)}</span>
          </div>
          {provider.distance && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{provider.distance} km</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.services.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            R{provider.price_min} - R{provider.price_max}
          </span>
          <Button className="bg-primary hover:bg-primary/90 text-white h-9 px-6">
            Book
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
