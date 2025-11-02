import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  QueryServiceFunction,
  UseServiceQueryResult,
  UseServiceQueryOptions,
} from './types';

/**
 * Custom hook for fetching data with TanStack Query (for GET/read operations)
 *
 * @example
 * ```typescript
 * const decks = useServiceQuery(['decks'], deckService.getAll, {
 *   staleTime: 5 * 60 * 1000, // 5 minutes
 *   onSuccess: (data) => console.log('Loaded decks:', data)
 * });
 *
 * if (decks.isLoading) return <div>Loading...</div>;
 * if (decks.error) return <div>Error: {decks.error.message}</div>;
 * return <div>{decks.result.length} decks loaded</div>;
 * ```
 *
 * @param queryKey - Unique key for the query (used for caching)
 * @param service - The service function to call
 * @param params - Parameters to pass to the service
 * @param options - Configuration options
 * @returns Object with loading/error states, result, and refetch function
 */
export function useServiceQuery<TParams = void, TData = unknown>(
  queryKey: unknown[],
  service: QueryServiceFunction<TParams, TData>,
  params: TParams,
  options?: UseServiceQueryOptions<TData>
): UseServiceQueryResult<TData> {
  const queryOptions: UseQueryOptions<TData, Error> = {
    queryKey: [...queryKey, params],
    queryFn: () => service(params),
    enabled: options?.enabled,
    retry: options?.retry,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    refetchInterval: options?.refetchInterval,
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

/**
 * Overload for service without parameters
 */
export function useServiceQueryWithoutParams<TData = unknown>(
  queryKey: unknown[],
  service: () => Promise<TData>,
  options?: UseServiceQueryOptions<TData>
): UseServiceQueryResult<TData> {
  const queryOptions: UseQueryOptions<TData, Error> = {
    queryKey,
    queryFn: service,
    enabled: options?.enabled,
    retry: options?.retry,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    refetchInterval: options?.refetchInterval,
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

