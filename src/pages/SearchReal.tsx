import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/search/SearchBar";
import FiltersPanel from "@/components/search/FiltersPanel";
import ResultsHeader from "@/components/search/ResultsHeader";
import ProviderCard from "@/components/search/ProviderCard";
import ProviderMap from "@/components/search/ProviderMap";
import ProviderProfileModal from "@/components/search/ProviderProfileModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Provider, SearchFilters, ViewMode, SortOption } from "@/types/provider";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProviderProfile {
  id: string;
  name: string;
  avatar: string;
  bannerImage?: string;
  rating: number;
  reviewCount: number;
  location: string;
  bio: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
  availability?: string[];
  portfolioImages?: string[];
  verified: boolean;
  city?: string;
  suburb?: string;
  priceRange?: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("highest_rated");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeMode, setActiveMode] = useState<'browse' | 'map' | 'nearme'>('browse');
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    serviceTypes: [] as string[],
    minRating: 0,
    priceRange: [0, 5000] as [number, number],
    distanceRadius: 50,
  });

  const itemsPerPage = 12;

  useEffect(() => {
    loadProviders();
  }, [filters.serviceTypes, filters.minRating, filters.priceRange]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      // Get user's location
      let userLat = -33.9249; // Default: Cape Town center
      let userLng = 18.4241;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
        } catch (error) {
          console.log('Using default location');
        }
      }

      // Calculate distance using Haversine formula
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal
      };

      // Fetch providers from database
      const { data: profiles, error } = await supabase
        .from("provider_profiles")
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url
          )
        `);

      if (error) throw error;

      const transformedProviders: Provider[] = (profiles || []).map((p) => {
        // Default Cape Town coordinates
        const lat = -33.9249 + (Math.random() - 0.5) * 0.1;
        const lng = 18.4241 + (Math.random() - 0.5) * 0.1;

        return {
          id: p.user_id,
          name: p.business_name || p.profiles.full_name || "Provider",
          avatar: p.profiles.avatar_url || p.business_logo_url || "/placeholder.svg",
          rating: Number(p.rating) || 5.0,
          services: ['Hair Styling', 'Makeup', 'Nails'],
          price_min: 300,
          price_max: 1500,
          lat,
          lng,
          verified: true,
          distance: calculateDistance(userLat, userLng, lat, lng),
          city: "Cape Town",
          suburb: p.business_address || "City Center"
        };
      });

      // Apply service type filter
      let filtered = transformedProviders;
      if (filters.serviceTypes.length > 0) {
        filtered = transformedProviders.filter(p =>
          p.services.some(s =>
            filters.serviceTypes.some(filter =>
              s.toLowerCase().includes(filter.toLowerCase())
            )
          )
        );
      }

      // Apply rating filter
      if (filters.minRating > 0) {
        filtered = filtered.filter(p => p.rating >= filters.minRating);
      }

      // Apply price range filter
      filtered = filtered.filter(p =>
        p.price_min >= filters.priceRange[0] && p.price_max <= filters.priceRange[1]
      );

      // Sort providers
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "highest_rated") return b.rating - a.rating;
        if (sortBy === "nearest") return (a.distance || 0) - (b.distance || 0);
        return 0; // "best_match" - keep original order
      });

      setProviders(sorted);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, location: string) => {
    setFilters({ ...filters, query, location });
    setCurrentPage(1);
    setSearchParams({ q: query, location });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleViewProfile = (provider: Provider) => {
    // Transform Provider to ProviderProfile format with mock services
    const profileData: ProviderProfile = {
      id: provider.id,
      name: provider.name,
      avatar: provider.avatar,
      bannerImage: provider.avatar,
      rating: provider.rating,
      reviewCount: 127,
      location: provider.city ? `${provider.city}${provider.suburb ? ', ' + provider.suburb : ''}` : 'Cape Town',
      bio: 'Experienced beauty professional specializing in quality service and customer satisfaction. Committed to helping you look and feel your best.',
      services: [
        {
          id: '1',
          name: 'Signature Style',
          price: provider.price_min,
          duration: 60,
          description: 'Our most popular service'
        },
        {
          id: '2',
          name: 'Premium Treatment',
          price: Math.round((provider.price_min + provider.price_max) / 2),
          duration: 90,
          description: 'Complete transformation experience'
        },
        {
          id: '3',
          name: 'Deluxe Package',
          price: provider.price_max,
          duration: 120,
          description: 'Full luxury treatment'
        }
      ],
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      portfolioImages: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
        'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800',
        'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800',
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800'
      ],
      verified: provider.verified,
      city: provider.city,
      suburb: provider.suburb,
      priceRange: `R${provider.price_min} - R${provider.price_max}`
    };
    setSelectedProvider(profileData);
  };

  const handleBookFromProfile = () => {
    if (selectedProvider) {
      navigate(`/booking?provider=${selectedProvider.id}`);
      setSelectedProvider(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(providers.length / itemsPerPage);
  const paginatedProviders = providers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Header */}
      <section className="pt-32 pb-8 px-4 md:px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
            Find Your Perfect Beauty Professional
          </h1>
          <SearchBar 
            onSearch={handleSearch} 
            activeMode={activeMode}
            onModeChange={setActiveMode}
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersPanel
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters & Search Options
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={handleFilterChange}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <ResultsHeader
              viewMode={viewMode}
              onViewModeChange={(mode) => setViewMode(mode)}
              sortBy={sortBy}
              onSortChange={(sort) => setSortBy(sort)}
              totalResults={providers.length}
              currentPage={currentPage}
              pageSize={itemsPerPage}
            />

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No providers found matching your criteria</p>
              </div>
            ) : (
              <>
                {viewMode === "map" ? (
                  <ProviderMap providers={providers} />
                ) : (
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {paginatedProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        viewMode={viewMode}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && viewMode !== "map" && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Provider Profile Modal */}
      <ProviderProfileModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onBook={handleBookFromProfile}
      />

      <Footer />
    </div>
  );
};

export default Search;
