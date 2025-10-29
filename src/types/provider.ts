export interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  services: string[];
  price_min: number;
  price_max: number;
  lat: number;
  lng: number;
  verified: boolean;
  distance?: number;
  city?: string;
  suburb?: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  serviceTypes: string[];
  minRating: number;
  priceRange: [number, number];
  availability?: Date;
  distanceRadius: number;
}

export type ViewMode = 'grid' | 'list' | 'map';
export type SortOption = 'best_match' | 'nearest' | 'highest_rated';
