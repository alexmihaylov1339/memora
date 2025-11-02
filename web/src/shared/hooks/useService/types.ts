/**
 * Generic service function that accepts parameters and returns a Promise
 */
export type ServiceFunction<TParams = void, TData = unknown> = (
  params: TParams
) => Promise<TData>;

/**
 * Service function without parameters
 */
export type ServiceFunctionWithoutParams<TData = unknown> = () => Promise<TData>;

/**
 * Result returned by useService hook
 */
export interface UseServiceResult<TData, TParams> {
  /** Execute the service with given parameters */
  fetch: (params: TParams) => Promise<TData>;
  /** Whether the service is currently loading */
  isLoading: boolean;
  /** Whether the service has loaded successfully at least once */
  isLoaded: boolean;
  /** Error from the service call, if any */
  error: Error | null;
  /** Result data from the service */
  result: TData | undefined;
  /** Reset the service state */
  reset: () => void;
}

/**
 * Options for configuring useService behavior
 */
export interface UseServiceOptions<TData = unknown> {
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
  /** Callback when service succeeds */
  onSuccess?: (data: TData) => void;
  /** Callback when service fails */
  onError?: (error: Error) => void;
  /** Number of retry attempts (default: from QueryClient config) */
  retry?: number;
  /** Custom retry delay in milliseconds */
  retryDelay?: number;
}

