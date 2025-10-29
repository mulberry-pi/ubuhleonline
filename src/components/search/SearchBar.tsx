import { Search, MapPin, Locate } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  activeMode: 'browse' | 'map' | 'nearme';
  onModeChange: (mode: 'browse' | 'map' | 'nearme') => void;
}

const SearchBar = ({ onSearch, activeMode, onModeChange }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        onSearch(query, `${position.coords.latitude}, ${position.coords.longitude}`);
      });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search name, service or stylist…"
          className="h-[52px] pl-12 pr-4 text-base"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value, location);
          }}
        />
      </div>

      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Location"
          className="h-[52px] pl-12 pr-12 text-base"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            onSearch(query, e.target.value);
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleGeolocate}
        >
          <Locate className="w-5 h-5" />
        </Button>
      </div>

    </div>
  );
};

export default SearchBar;
