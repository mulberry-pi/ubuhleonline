import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/search/SearchBar';
import FiltersPanel from '@/components/search/FiltersPanel';
import ResultsHeader from '@/components/search/ResultsHeader';
import ProviderCard from '@/components/search/ProviderCard';
import ProviderMap from '@/components/search/ProviderMap';
import { Button } from '@/components/ui/button';
import { SearchFilters, ViewMode, SortOption, Provider } from '@/types/provider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Search = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [searchMode, setSearchMode] = useState<'browse' | 'map' | 'nearme'>('browse');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
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
      const { data, error } = await supabase
        .from('provider_profiles')
        .select(`
          user_id,
          business_name,
          business_description,
          business_address,
          business_logo_url,
          rating,
          is_public,
          profiles!provider_profiles_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true);

      if (error) throw error;

      // Get services for each provider
      const providersWithServices = await Promise.all(
        (data || []).map(async (p) => {
          const { data: services } = await supabase
            .from('services')
            .select('name, price')
            .eq('provider_id', p.user_id)
            .eq('is_available', true);

          const serviceNames = (services || []).map(s => s.name);
          const prices = (services || []).map(s => Number(s.price));

          return {
            id: p.user_id,
            name: p.profiles?.full_name || p.business_name || 'Professional',
            avatar: p.profiles?.avatar_url || p.business_logo_url || '/placeholder.svg',
            rating: Number(p.rating) || 0,
            services: serviceNames,
            price_min: prices.length > 0 ? Math.min(...prices) : 0,
            price_max: prices.length > 0 ? Math.max(...prices) : 0,
            lat: -33.9249,
            lng: 18.4241,
            verified: true,
            distance: 0
          };
        })
      );

      setProviders(providersWithServices);
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
    </div>
  );
};

export default Search;
