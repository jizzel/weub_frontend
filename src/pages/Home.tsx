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
import { usePagination, DOTS } from '../hooks/usePagination';

const ITEMS_PER_PAGE = 12;

export function Home() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});
  const { isDemoMode } = useDemoMode();

  const debouncedSearch = useDebounce(searchQuery, 300);

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
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const totalPages = data?.pagination?.totalPages ?? 0;
  const paginationRange = usePagination({ totalPages, page });

  return (
    <div className="container mx-auto px-4 py-8">
      {isDemoMode && <DemoModeBanner />}
      
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Unable to connect to the API. Please ensure the backend is running at{' '}
            {import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'}
          </AlertDescription>
        </Alert>
      )}

      <VideoList videos={data?.items || []} isLoading={isLoading} />

      {data && totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={!data.pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {paginationRange?.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                  return <PaginationEllipsis key={`dots-${index}`} />;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      onClick={() => setPage(pageNumber as number)}
                      isActive={page === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
