import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Provider } from '@/types/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X } from 'lucide-react';

interface ProviderMapProps {
  providers: Provider[];
}

const ProviderMap = ({ providers }: ProviderMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    // Get token from environment variable
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (token) {
      setMapboxToken(token);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [18.4241, -33.9249], // Cape Town center
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for each provider
      providers.forEach((provider) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer';
        el.innerHTML = `
          <div class="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/>
            </svg>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedProvider(provider);
        });

        new mapboxgl.Marker(el)
          .setLngLat([provider.lng, provider.lat])
          .addTo(map.current!);
      });
    } catch (error) {
      console.error('Mapbox initialization error:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [providers, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-lg h-[640px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="rounded-2xl shadow-lg h-[640px]" />

      {selectedProvider && (
        <div className="absolute top-4 right-4 bg-card rounded-2xl shadow-2xl overflow-hidden w-80 animate-fade-in-up">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setSelectedProvider(null)}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="relative h-32">
            <img
              src={selectedProvider.avatar}
              alt={selectedProvider.name}
              className="w-full h-full object-cover"
            />
            {selectedProvider.verified && (
              <Badge className="absolute top-2 left-2 bg-primary text-white">
                Verified
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-base mb-2">{selectedProvider.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm">
                  {selectedProvider.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedProvider.distance} km away
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {selectedProvider.services.slice(0, 2).map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              Book Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderMap;
