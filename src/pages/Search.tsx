import { useState } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/search/SearchBar';
import FiltersPanel from '@/components/search/FiltersPanel';
import ResultsHeader from '@/components/search/ResultsHeader';
import ProviderCard from '@/components/search/ProviderCard';
import ProviderMap from '@/components/search/ProviderMap';
import { Button } from '@/components/ui/button';
import { SearchFilters, ViewMode, SortOption } from '@/types/provider';
import { mockProviders } from '@/data/mockProviders';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Search = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('best_match');
  const [searchMode, setSearchMode] = useState<'browse' | 'map' | 'nearme'>('browse');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    serviceTypes: [],
    minRating: 0,
    priceRange: [0, 5000],
    distanceRadius: 50,
  });

  const pageSize = 12;

  // Filter and sort providers
  let filteredProviders = mockProviders.filter((provider) => {
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
    <div className="min-h-screen bg-background font-jakarta">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-lg">
              <SearchBar
                onSearch={handleSearch}
                activeMode={searchMode}
                onModeChange={setSearchMode}
              />
              <div className="border-t border-border my-6" />
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              <FiltersPanel filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          {/* Main Content - Results */}
          <div className="flex-1 min-w-0">
            {viewMode !== 'map' && (
              <ResultsHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredProviders.length}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            )}

            {viewMode === 'map' ? (
              <ProviderMap providers={filteredProviders} />
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        className="w-10 h-10"
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
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
