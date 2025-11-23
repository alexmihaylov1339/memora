import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import type {
  ServiceFunction,
  UseServiceResult,
  UseServiceOptions,
} from './types';

/**
 * Custom hook for calling services with TanStack Query
 *
 * @example
 * ```typescript
 * const createDeck = useService(deckService.create, {
 *   onSuccess: () => console.log('Deck created!'),
 *   onError: (error) => console.error(error)
 * });
 *
 * // Later in your code:
 * await createDeck.fetch({ name: 'My Deck', description: 'Description' });
 * ```
 *
 * @param service - The service function to call
 * @param options - Configuration options
 * @returns Object with fetch function, loading/error states, and result
 */
export function useService<TParams = void, TData = unknown>(
  service: ServiceFunction<TParams, TData>,
  options?: UseServiceOptions<TData>
): UseServiceResult<TData, TParams> {
  const mutationOptions: UseMutationOptions<TData, Error, TParams> = {
    mutationFn: (params: TParams) => service(params),
    retry: options?.retry,
    retryDelay: options?.retryDelay,
    onSuccess: (data) => {
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  };

  const mutation = useMutation(mutationOptions);

  return {
    fetch: (params: TParams) => mutation.mutateAsync(params),
    isLoading: mutation.isPending,
    isLoaded: mutation.isSuccess,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}

