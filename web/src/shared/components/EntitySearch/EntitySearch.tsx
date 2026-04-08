'use client';

import { useEntitySearch } from '@features/search';
import type { SearchResultItem, SearchServiceFunction } from '@features/search';

interface EntitySearchProps {
  queryKey: readonly unknown[];
  search: SearchServiceFunction;
  onSelect: (item: SearchResultItem) => void;
  placeholder?: string;
}

export default function EntitySearch({
  queryKey,
  search,
  onSelect,
  placeholder,
}: EntitySearchProps) {
  const { query, setQuery, debouncedQuery, isLoading, error, results } =
    useEntitySearch(queryKey, search);

  const showDropdown = debouncedQuery.length > 0;

  return (
    <div>
      <label>
        <span>Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder ?? 'Search'}
        />
      </label>

      {showDropdown && (
        <div>
          {isLoading && <p>Loading results...</p>}
          {error && <p>{error.message}</p>}
          {!isLoading && !error && results.length === 0 && <p>No results found.</p>}
          {!isLoading && !error && results.length > 0 && (
            <ul>
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setQuery('');
                    }}
                  >
                    <span>{item.label}</span>
                    {item.description && <span> {item.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
