/**
 * Home page with video listing, search, and filters
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDemoMode } = useDemoMode();

  // --- State derived from URL --- //
  const page = Number(searchParams.get('page') || '1');
  const urlSearch = searchParams.get('title') || '';
  const filters: FilterValues = useMemo(() => ({
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
    resolution: searchParams.get('resolution') || undefined,
    tags: searchParams.get('tags') || undefined,
  }), [searchParams]);

  // --- Local state for controlled inputs --- //
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  // --- API Query --- //
  const queryParams = useMemo(() => ({
    page,
    limit: ITEMS_PER_PAGE,
    title: debouncedSearch || undefined,
    ...filters,
  }), [page, debouncedSearch, filters]);

  const { data, isLoading, error } = useVideos(queryParams);

  // --- Effects to sync state with URL --- //

  // Update URL when debounced search term changes
  useEffect(() => {
    const current = new URLSearchParams(searchParams);
    const currentTitle = current.get('title') || '';

    if (currentTitle !== debouncedSearch) {
      if (debouncedSearch) {
        current.set('title', debouncedSearch);
      } else {
        current.delete('title');
      }
      current.set('page', '1');
      setSearchParams(current, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  // Update local search input if URL changes (e.g., back button)
  useEffect(() => {
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
    }
  }, [urlSearch]);


  // --- Event Handlers --- //

  const updateSearchParams = (newParams: Record<string, string | undefined | null>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    setSearchParams(current, { replace: true });
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    updateSearchParams({ ...newFilters, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.pagination?.totalPages ?? 0)) {
      updateSearchParams({ page: String(newPage) });
    }
  };

  const totalPages = data?.pagination?.totalPages ?? 0;
  const paginationRange = usePagination({ totalPages, page });

  return (
    <div className="container mx-auto px-4 py-8">
      {isDemoMode && <DemoModeBanner />}
      
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Library</h1>
            {data && (
              <p className="text-muted-foreground">
                {`${data.pagination.totalItems} ${data.pagination.totalItems === 1 ? 'video' : 'videos'} total`}
              </p>
            )}
          </div>
          <Button asChild>
            <ForwardedLink to="/upload">
              <UploadIcon className="mr-2 size-4" />
              Upload Video
            </ForwardedLink>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
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
            Unable to connect to the API. Please ensure the backend is running.
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
                  onClick={() => handlePageChange(page - 1)}
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
                      onClick={() => handlePageChange(pageNumber as number)}
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
                  onClick={() => handlePageChange(page + 1)}
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
