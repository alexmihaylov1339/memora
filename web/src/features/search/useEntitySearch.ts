import { useEffect, useMemo, useState } from 'react';
import { useServiceQuery } from '@shared/hooks';
import type { SearchServiceFunction } from './types';

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_SEARCH_LIMIT = 8;

export function useEntitySearch(
  queryKey: readonly unknown[],
  search: SearchServiceFunction,
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const searchQuery = useMemo(
    () => ({
      q: debouncedQuery,
      limit: DEFAULT_SEARCH_LIMIT,
    }),
    [debouncedQuery],
  );

  const resultsQuery = useServiceQuery(
    queryKey,
    search,
    searchQuery,
    {
      enabled: debouncedQuery.length > 0,
      retry: 0,
      staleTime: 0,
    refetchOnWindowFocus: false,
    },
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    isLoading: resultsQuery.isLoading || resultsQuery.isRefetching,
    error: resultsQuery.error,
    results: resultsQuery.result ?? [],
  };
}
