/**
 * Home page with video listing, search, and filters
 */

import { useState, useMemo } from 'react';
import { VideoList } from '../components/VideoList';
import { SearchBar } from '../components/SearchBar';
import { VideoFilters, FilterValues } from '../components/VideoFilters';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { Button } from '../components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { useVideos } from '../hooks/useVideos';
import { useDemoMode } from '../hooks/useDemoMode';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Upload as UploadIcon } from 'lucide-react';
import { ForwardedLink } from '../components/ForwardedLink';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 12;

export function Home() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});
  const { isDemoMode } = useDemoMode();

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build query params
  const queryParams = useMemo(() => ({
    page,
    limit: ITEMS_PER_PAGE,
    title: debouncedSearch || undefined,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    resolution: filters.resolution,
    tags: filters.tags,
  }), [page, debouncedSearch, filters]);

  const { data, isLoading, error } = useVideos(queryParams);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when search changes
  };

  const totalPages = data?.pagination?.totalPages ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Mode Banner */}
      {isDemoMode && <DemoModeBanner />}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Video Library</h1>
            <p className="text-muted-foreground">
              {data && `${data.pagination.totalItems} ${data.pagination.totalItems === 1 ? 'video' : 'videos'} total`}
            </p>
          </div>
          <Button asChild>
            <ForwardedLink to="/upload">
              <UploadIcon className="mr-2 size-4" />
              Upload Video
            </ForwardedLink>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title..."
            />
          </div>
          <VideoFilters filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Unable to connect to the API. Please ensure the backend is running at{' '}
            {import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'}
          </AlertDescription>
        </Alert>
      )}

      {/* Video List */}
      <VideoList videos={data?.items || []} isLoading={isLoading} />

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={!data.pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* First page */}
              {page > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(1)} className="cursor-pointer">
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis */}
              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Previous page */}
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(page - 1)} className="cursor-pointer">
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive className="cursor-default">
                  {page}
                </PaginationLink>
              </PaginationItem>

              {/* Next page */}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(page + 1)} className="cursor-pointer">
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis */}
              {page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={!data.pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
