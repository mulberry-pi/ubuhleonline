import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/search/SearchBar";
import FiltersPanel from "@/components/search/FiltersPanel";
import ResultsHeader from "@/components/search/ResultsHeader";
import ProviderCard from "@/components/search/ProviderCard";
import ProviderMap from "@/components/search/ProviderMap";
import { Provider } from "@/types/provider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ViewMode = "grid" | "list" | "map";
type SortOption = "nearest" | "rating" | "match";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    serviceTypes: [] as string[],
    rating: 0,
    priceRange: [0, 5000] as [number, number],
    distance: 50,
  });

  const itemsPerPage = 12;

  useEffect(() => {
    loadProviders();
  }, [filters.serviceTypes, filters.rating, filters.priceRange]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('provider_profiles')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            avatar_url,
            email
          ),
          services (
            id,
            name,
            price,
            duration_minutes,
            description
          )
        `)
        .eq('is_public', true);

      // Apply rating filter
      if (filters.rating > 0) {
        query = query.gte('rating', filters.rating);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to Provider type
      const transformedProviders: Provider[] = (data || []).map(p => {
        const services = p.services || [];
        const prices = services.map(s => parseFloat(s.price || '0'));
        const serviceNames = services.map(s => s.name);

        return {
          id: p.user_id,
          name: p.profiles.full_name || p.business_name || 'Professional',
          avatar: p.profiles.avatar_url || p.business_logo_url || '/placeholder.svg',
          rating: parseFloat(p.rating || '0'),
          services: serviceNames,
          price_min: prices.length > 0 ? Math.min(...prices) : 0,
          price_max: prices.length > 0 ? Math.max(...prices) : 0,
          lat: -33.9249, // Default Cape Town coords
          lng: 18.4241,
          verified: true,
          distance: 0
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

      // Apply price range filter
      filtered = filtered.filter(p =>
        p.price_min >= filters.priceRange[0] && p.price_max <= filters.priceRange[1]
      );

      // Sort providers
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "nearest") return a.distance - b.distance;
        return 0; // "match" - keep original order
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

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
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
      <section className="pt-32 pb-8 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            Find Your Perfect Beauty Professional
          </h1>
          <SearchBar onSearch={handleSearch} defaultQuery={filters.query} defaultLocation={filters.location} />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <FiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Results */}
          <main className="flex-1">
            <ResultsHeader
              count={providers.length}
              viewMode={viewMode}
              sortBy={sortBy}
              onViewModeChange={setViewMode}
              onSortChange={setSortBy}
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

      <Footer />
    </div>
  );
};

export default Search;
