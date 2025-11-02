import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SearchBar from '@/components/search/SearchBar';
import FiltersPanel from '@/components/search/FiltersPanel';
import ResultsHeader from '@/components/search/ResultsHeader';
import ProviderCard from '@/components/search/ProviderCard';
import ProviderMap from '@/components/search/ProviderMap';
import ProviderProfileModal from '@/components/search/ProviderProfileModal';
import { Button } from '@/components/ui/button';
import { SearchFilters, ViewMode, SortOption, Provider } from '@/types/provider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockProviders } from '@/data/mockProviders';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [searchMode, setSearchMode] = useState<'browse' | 'map' | 'nearme'>('browse');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    serviceTypes: [],
    minRating: 0,
    priceRange: [0, 5000],
    distanceRadius: 50,
  });

  const pageSize = 12;

  // Load providers from database
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      // Using mock data for testing
      const providersData: Provider[] = mockProviders.map((p) => ({
        id: p.user_id,
        name: p.business_name,
        avatar: p.business_logo_url,
        rating: p.rating,
        services: ['Hair Styling', 'Makeup', 'Nails'], // Mock services
        price_min: parseInt(p.price_range.split(' - ')[0].replace('R', '')),
        price_max: parseInt(p.price_range.split(' - ')[1].replace('R', '')),
        lat: -33.9249 + (Math.random() - 0.5) * 0.1, // Random coords near Cape Town
        lng: 18.4241 + (Math.random() - 0.5) * 0.1,
        verified: true,
        distance: Math.round(Math.random() * 10),
        city: p.city,
        suburb: p.suburb
      }));

      setProviders(providersData);
      toast.success(`Found ${providersData.length} providers!`);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort providers
  let filteredProviders = providers.filter((provider) => {
    const matchesQuery =
      !filters.query ||
      provider.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      provider.services.some((s) => s.toLowerCase().includes(filters.query.toLowerCase()));

    const matchesServices =
      filters.serviceTypes.length === 0 ||
      provider.services.some((s) => filters.serviceTypes.includes(s));

    const matchesRating = provider.rating >= filters.minRating;

    const matchesPrice =
      provider.price_min >= filters.priceRange[0] &&
      provider.price_max <= filters.priceRange[1];

    const matchesDistance =
      !provider.distance || provider.distance <= filters.distanceRadius;

    return matchesQuery && matchesServices && matchesRating && matchesPrice && matchesDistance;
  });

  // Sort providers
  if (sortBy === 'nearest') {
    filteredProviders.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } else if (sortBy === 'highest_rated') {
    filteredProviders.sort((a, b) => b.rating - a.rating);
  }

  const totalPages = Math.ceil(filteredProviders.length / pageSize);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = (query: string, location: string) => {
    setFilters({ ...filters, query, location });
    setCurrentPage(1);
  };

  const handleViewProfile = (provider: Provider) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Layout with Sticky Sidebar */}
      <div className="pt-20 flex w-full">
        {/* Left Sidebar - Search and Filters */}
        <aside className="w-80 bg-card border-r sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Find Stylists
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover beauty professionals
              </p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              activeMode={searchMode}
              onModeChange={setSearchMode}
            />

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              <FiltersPanel filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </aside>

        {/* Right Content - Map and Results */}
        <main className="flex-1 p-6 overflow-auto">
          {/* View Controls */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {filteredProviders.length} Stylist{filteredProviders.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing results {currentPage > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredProviders.length)}
              </p>
            </div>
            <ResultsHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={filteredProviders.length}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Finding your perfect stylists...</p>
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                <div className="h-[calc(100vh-12rem)]">
                  <ProviderMap providers={filteredProviders} />
                </div>
              ) : (
                <>
                  {paginatedProviders.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl shadow-sm border">
                      <div className="max-w-md mx-auto">
                        <p className="text-muted-foreground text-xl mb-2">No stylists found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search filters or location</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`grid gap-6 ${
                        viewMode === 'grid'
                          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                          : 'grid-cols-1 max-w-4xl'
                      }`}
                    >
                      {paginatedProviders.map((provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          viewMode={viewMode === 'list' ? 'list' : 'grid'}
                          onViewProfile={handleViewProfile}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          className="w-10 h-10 rounded-full"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Provider Profile Modal */}
      <ProviderProfileModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onBook={handleBookFromProfile}
      />
    </div>
  );
};

export default Search;
