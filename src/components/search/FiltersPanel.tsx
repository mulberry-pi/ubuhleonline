import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { SearchFilters } from '@/types/provider';
import { useState } from 'react';

interface FiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const serviceTypes = [
  'Hair Styling',
  'Braiding',
  'Makeup',
  'Nails',
  'Natural Hair',
  'Color',
  'Spa',
  'Lashes',
  'Treatments',
  'Weaves',
];

const FiltersPanel = ({ filters, onFiltersChange }: FiltersPanelProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleServiceToggle = (service: string) => {
    const newServices = localFilters.serviceTypes.includes(service)
      ? localFilters.serviceTypes.filter((s) => s !== service)
      : [...localFilters.serviceTypes, service];
    setLocalFilters({ ...localFilters, serviceTypes: newServices });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      location: '',
      serviceTypes: [],
      minRating: 0,
      priceRange: [0, 5000],
      distanceRadius: 50,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-6 pr-4">
      <div>
        <h3 className="font-semibold text-base mb-3">Service Type</h3>
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
          {serviceTypes.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={localFilters.serviceTypes.includes(service)}
                onCheckedChange={() => handleServiceToggle(service)}
              />
              <Label
                htmlFor={service}
                className="text-sm cursor-pointer flex-1"
              >
                {service}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          <Slider
            value={[localFilters.minRating]}
            onValueChange={([value]) =>
              setLocalFilters({ ...localFilters, minRating: value })
            }
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span className="font-medium text-foreground">
              {localFilters.minRating.toFixed(1)}
            </span>
            <span>5.0</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.priceRange[0]}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priceRange: [Number(e.target.value), localFilters.priceRange[1]],
                })
              }
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.priceRange[1]}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priceRange: [localFilters.priceRange[0], Number(e.target.value)],
                })
              }
              className="h-9"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-3">Distance Radius</h3>
        <div className="space-y-2">
          <Slider
            value={[localFilters.distanceRadius]}
            onValueChange={([value]) =>
              setLocalFilters({ ...localFilters, distanceRadius: value })
            }
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>5 km</span>
            <span className="font-medium text-foreground">
              {localFilters.distanceRadius} km
            </span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1 h-10">
          Apply
        </Button>
        <Button onClick={handleClear} variant="outline" className="flex-1 h-10">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default FiltersPanel;
