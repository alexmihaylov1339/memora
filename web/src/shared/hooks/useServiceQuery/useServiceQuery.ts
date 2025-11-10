import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  QueryServiceFunction,
  UseServiceQueryResult,
  UseServiceQueryOptions,
} from './types';

// Default configuration values
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_GC_TIME = 10 * 60 * 1000; // 10 minutes
const DEFAULT_REFETCH_ON_WINDOW_FOCUS = true;
const DEFAULT_REFETCH_INTERVAL = false;

/**
 * Custom hook for fetching data with TanStack Query (for GET/read operations)
 *
 * @example
 * ```typescript
 * // Without parameters - clean API
 * const decks = useServiceQuery(['decks'], deckService.getAll);
 *
 * // With parameters
 * const deck = useServiceQuery(['deck', id], deckService.getById, { id });
 *
 * // With options
 * const decks = useServiceQuery(['decks'], deckService.getAll, {
 *   staleTime: 1 * 60 * 1000, // Override: 1 minute instead of default 5
 *   refetchInterval: 30 * 1000, // Override: poll every 30 seconds
 * });
 *
 * if (decks.isLoading) return <div>Loading...</div>;
 * if (decks.error) return <div>Error: {decks.error.message}</div>;
 * return <div>{decks.result.length} decks loaded</div>;
 * ```
 *
 * @param queryKey - Unique key for the query (used for caching)
 * @param service - The service function to call
 * @param paramsOrOptions - Parameters to pass to service, or options if service has no params
 * @param options - Configuration options (optional, has sensible defaults)
 *   - enabled: true (can disable query)
 *   - retry: 3 (retry failed requests 3 times)
 *   - staleTime: 5 minutes (data considered fresh)
 *   - gcTime: 10 minutes (unused data kept in cache)
 *   - refetchOnWindowFocus: true (refetch when user returns)
 *   - refetchInterval: false (no automatic polling)
 * @returns Object with loading/error states, result, and refetch function
 */

// Overload: service without params
export function useServiceQuery<TData = unknown>(
  queryKey: unknown[],
  service: () => Promise<TData>,
  options?: UseServiceQueryOptions<TData>
): UseServiceQueryResult<TData>;

// Overload: service with params
export function useServiceQuery<TParams, TData = unknown>(
  queryKey: unknown[],
  service: QueryServiceFunction<TParams, TData>,
  params: TParams,
  options?: UseServiceQueryOptions<TData>
): UseServiceQueryResult<TData>;

// Implementation
export function useServiceQuery<TParams = void, TData = unknown>(
  queryKey: unknown[],
  service: QueryServiceFunction<TParams, TData> | (() => Promise<TData>),
  paramsOrOptions?: TParams | UseServiceQueryOptions<TData>,
  options?: UseServiceQueryOptions<TData>
): UseServiceQueryResult<TData> {
  // Detect if third argument is params or options
  const hasParams = options !== undefined ||
    (paramsOrOptions !== undefined &&
     !('enabled' in (paramsOrOptions as object || {}) ||
       'retry' in (paramsOrOptions as object || {}) ||
       'staleTime' in (paramsOrOptions as object || {})));

  const params = hasParams ? (paramsOrOptions as TParams) : undefined;
  const finalOptions = hasParams ? options : (paramsOrOptions as UseServiceQueryOptions<TData>);

  const queryOptions: UseQueryOptions<TData, Error> = {
    queryKey: params !== undefined ? [...queryKey, params] : queryKey,
    queryFn: () => params !== undefined
      ? (service as QueryServiceFunction<TParams, TData>)(params)
      : (service as () => Promise<TData>)(),
    // Default: enabled unless explicitly disabled
    enabled: finalOptions?.enabled ?? true,
    // Default: retry 3 times on failure
    retry: finalOptions?.retry ?? DEFAULT_RETRY_COUNT,
    // Default: data fresh for 5 minutes
    staleTime: finalOptions?.staleTime ?? DEFAULT_STALE_TIME,
    // Default: keep in cache for 10 minutes
    gcTime: finalOptions?.gcTime ?? DEFAULT_GC_TIME,
    // Default: refetch when user returns to window
    refetchOnWindowFocus: finalOptions?.refetchOnWindowFocus ?? DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    // Default: no automatic polling (can be overridden)
    refetchInterval: finalOptions?.refetchInterval ?? DEFAULT_REFETCH_INTERVAL,
  };

  const query = useQuery(queryOptions);

  return {
    isLoading: query.isLoading,
    isLoaded: query.isSuccess,
    error: query.error,
    result: query.data,
    refetch: async () => {
      await query.refetch();
    },
    isRefetching: query.isRefetching,
  };
}


