/**
 * Service function for queries (GET operations)
 */
export type QueryServiceFunction<TParams = void, TData = unknown> = (
  params: TParams
) => Promise<TData>;

/**
 * Query service function without parameters
 */
export type QueryServiceFunctionWithoutParams<TData = unknown> = () => Promise<TData>;

/**
 * Result returned by useServiceQuery hook
 */
export interface UseServiceQueryResult<TData> {
  /** Whether the query is currently loading */
  isLoading: boolean;
  /** Whether the query has loaded successfully at least once */
  isLoaded: boolean;
  /** Error from the query, if any */
  error: Error | null;
  /** Result data from the query */
  result: TData | undefined;
  /** Refetch the query */
  refetch: () => Promise<void>;
  /** Whether the query is currently refetching */
  isRefetching: boolean;
}

/**
 * Options for configuring useServiceQuery behavior
 */
export interface UseServiceQueryOptions<TData = unknown> {
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
  /** Callback when query succeeds */
  onSuccess?: (data: TData) => void;
  /** Callback when query fails */
  onError?: (error: Error) => void;
  /** Number of retry attempts */
  retry?: number;
  /** Stale time in milliseconds (default: 1 minute) */
  staleTime?: number;
  /** Cache time in milliseconds (default: 5 minutes) */
  gcTime?: number;
  /** Refetch on window focus (default: false) */
  refetchOnWindowFocus?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
}

