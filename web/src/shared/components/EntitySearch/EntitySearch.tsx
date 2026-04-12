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
    <div className="w-full">
      {isMultiSelect && showSelectedList && selectedItems.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <li
              key={`selected-${item.type}-${item.id}`}
              className="flex items-center gap-1 rounded-md bg-[#e8f0f9] px-2 py-1 text-sm text-[#1d6fa5]"
            >
              <span>{item.label}</span>
              {item.description && (
                <span className="text-[#1d6fa5]/60"> — {item.description}</span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.label}`}
                className="ml-1 text-[#1d6fa5]/60 transition hover:text-[#1d6fa5]"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative w-full">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[rgba(1,1,1,0.38)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <label className="block">
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder ?? 'Search'}
            className="h-10 w-full rounded-[8px] border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm text-[rgba(1,1,1,0.72)] placeholder:text-[rgba(1,1,1,0.38)] outline-none transition focus:border-[#1d6fa5] focus:ring-1 focus:ring-[#1d6fa5]"
          />
        </label>

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-[8px] border border-[#e5e7eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            {isLoading && (
              <p className="px-4 py-2.5 text-sm text-[rgba(1,1,1,0.4)]">Loading results...</p>
            )}
            {error && (
              <p className="px-4 py-2.5 text-sm text-[#dc2626]">{error.message}</p>
            )}
            {!isLoading && !error && results.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-[rgba(1,1,1,0.4)]">No results found.</p>
            )}
            {!isLoading && !error && results.length > 0 && isMultiSelect && (
              <ul>
                {results.map((item) => {
                  const isChecked = isSelectedItem(item, stagedItems);
                  return (
                    <li
                      key={`${item.type}-${item.id}`}
                      className="border-b border-[#e5e7eb] last:border-b-0"
                    >
                      <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-[#f6f8fc]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStaged(item)}
                          className="h-4 w-4 rounded border-[#e5e7eb] accent-[#1d6fa5]"
                        />
                        <span className="text-sm text-[rgba(1,1,1,0.72)]">{item.label}</span>
                        {item.description && (
                          <span className="text-sm text-[rgba(1,1,1,0.4)]">
                            {item.description}
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            {!isLoading && !error && isMultiSelect && (
              <div className="border-t border-[#e5e7eb] px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-[6px] bg-[#1d6fa5] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#1a5f8e]"
                >
                  Done
                </button>
              </div>
            )}
            {!isLoading && !error && results.length > 0 && !isMultiSelect && (
              <ul>
                {results.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="border-b border-[#e5e7eb] last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full px-4 py-2.5 text-left text-sm text-[rgba(1,1,1,0.72)] transition hover:bg-[#f6f8fc]"
                    >
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="ml-2 text-[rgba(1,1,1,0.4)]">{item.description}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
