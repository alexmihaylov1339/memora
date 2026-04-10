'use client';

import {
  SEARCH_SELECTION_MODES,
  useEntitySearch,
  type SearchResultItem,
  type SearchSelectionMode,
  type SearchServiceFunction,
} from '@features/search';
import { isSameSearchItem, isSelectedItem } from './helpers/searchSelection';

interface EntitySearchProps {
  queryKey: readonly unknown[];
  search: SearchServiceFunction;
  onSelect?: (item: SearchResultItem) => void;
  selectionMode?: SearchSelectionMode;
  selectedItems?: SearchResultItem[];
  onSelectionChange?: (items: SearchResultItem[]) => void;
  placeholder?: string;
}

export default function EntitySearch({
  queryKey,
  search,
  onSelect,
  selectionMode = SEARCH_SELECTION_MODES.single,
  selectedItems = [],
  onSelectionChange,
  placeholder,
}: EntitySearchProps) {
  const { query, setQuery, debouncedQuery, isLoading, error, results } =
    useEntitySearch(queryKey, search);

  const isMultiSelect = selectionMode === SEARCH_SELECTION_MODES.multiple;
  const showDropdown = debouncedQuery.length > 0;
  const visibleResults = isMultiSelect
    ? results.filter((item) => !isSelectedItem(item, selectedItems))
    : results;

  function handleSelect(item: SearchResultItem) {
    if (isMultiSelect) {
      if (!onSelectionChange || isSelectedItem(item, selectedItems)) {
        return;
      }

      onSelectionChange([...selectedItems, item]);
      setQuery('');
      return;
    }

    onSelect?.(item);
    setQuery('');
  }

  function handleRemove(itemToRemove: SearchResultItem) {
    if (!onSelectionChange) {
      return;
    }

    onSelectionChange(
      selectedItems.filter((item) => !isSameSearchItem(item, itemToRemove)),
    );
  }

  return (
    <div>
      {isMultiSelect && selectedItems.length > 0 && (
        <ul>
          {selectedItems.map((item) => (
            <li key={`selected-${item.type}-${item.id}`}>
              <span>{item.label}</span>
              {item.description && <span> {item.description}</span>}
              <button type="button" onClick={() => handleRemove(item)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

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
          {!isLoading && !error && visibleResults.length === 0 && <p>No results found.</p>}
          {!isLoading && !error && visibleResults.length > 0 && (
            <ul>
              {visibleResults.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
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
