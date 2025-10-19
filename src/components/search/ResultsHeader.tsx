import { ViewMode, SortOption } from '@/types/provider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutGrid, List, Map } from 'lucide-react';

interface ResultsHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  currentPage: number;
  pageSize: number;
}

const ResultsHeader = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  totalResults,
  currentPage,
  pageSize,
}: ResultsHeaderProps) => {
  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startResult}–{endResult}</span> of{' '}
        <span className="font-medium text-foreground">{totalResults}</span> providers
      </div>

      <div className="flex items-center gap-4">
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="best_match">Best match</SelectItem>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="highest_rated">Highest rated</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('map')}
          >
            <Map className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
