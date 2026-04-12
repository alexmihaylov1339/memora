'use client';

import { useEffect, useRef, useState } from 'react';
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
  showSelectedList?: boolean;
}

export default function EntitySearch({
  queryKey,
  search,
  onSelect,
  selectionMode = SEARCH_SELECTION_MODES.single,
  selectedItems = [],
  onSelectionChange,
  placeholder,
  showSelectedList = false,
}: EntitySearchProps) {
  const { query, setQuery, debouncedQuery, isLoading, error, results } =
    useEntitySearch(queryKey, search);

  const isMultiSelect = selectionMode === SEARCH_SELECTION_MODES.multiple;
  const showDropdown = debouncedQuery.length > 0;

  const [stagedItems, setStagedItems] = useState<SearchResultItem[]>([]);
  const prevShowDropdownRef = useRef(false);
  const selectedItemsRef = useRef(selectedItems);

  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    if (isMultiSelect && showDropdown && !prevShowDropdownRef.current) {
      setStagedItems(selectedItemsRef.current);
    }
    prevShowDropdownRef.current = showDropdown;
  }, [showDropdown, isMultiSelect]);

  function handleToggleStaged(item: SearchResultItem) {
    setStagedItems((prev) =>
      isSelectedItem(item, prev)
        ? prev.filter((i) => !isSameSearchItem(i, item))
        : [...prev, item],
    );
  }

  function handleConfirm() {
    onSelectionChange?.(stagedItems);
    setQuery('');
  }

  function handleSelect(item: SearchResultItem) {
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
      {isMultiSelect && showSelectedList && selectedItems.length > 0 && (
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
          {!isLoading && !error && results.length === 0 && <p>No results found.</p>}
          {!isLoading && !error && results.length > 0 && isMultiSelect && (
            <ul>
              {results.map((item) => {
                const isChecked = isSelectedItem(item, stagedItems);
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStaged(item)}
                      />
                      <span>{item.label}</span>
                      {item.description && <span> {item.description}</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {!isLoading && !error && isMultiSelect && (
            <button type="button" onClick={handleConfirm}>
              Done
            </button>
          )}
          {!isLoading && !error && results.length > 0 && !isMultiSelect && (
            <ul>
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button type="button" onClick={() => handleSelect(item)}>
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
