'use client';

import { useCallback, useMemo, useState } from 'react';

import { Button } from '@shared/components';
import type { SearchResultItem } from '@features/search';

import { useDecksListQuery } from '../hooks';
import DeckLibraryPickerGrid from './DeckLibraryPickerGrid';
import {
  filterDeckLibraryRows,
  mapDeckToLibraryRow,
  mapDeckToSearchResult,
} from './deckLibraryPickerHelpers';

interface DeckLibraryPickerProps {
  isOpen: boolean;
  selectedDecks: SearchResultItem[];
  onCancel: () => void;
  onConfirm: (items: SearchResultItem[]) => void;
}

export default function DeckLibraryPicker({
  isOpen,
  selectedDecks,
  onCancel,
  onConfirm,
}: DeckLibraryPickerProps) {
  const decksQuery = useDecksListQuery({ enabled: isOpen });
  const [searchText, setSearchText] = useState('');
  const [stagedSelectedIds, setStagedSelectedIds] = useState<Set<string>>(
    () => new Set(selectedDecks.map((deck) => deck.id)),
  );

  const handleToggleDeck = useCallback((deckId: string) => {
    setStagedSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(deckId)) {
        nextIds.delete(deckId);
      } else {
        nextIds.add(deckId);
      }

      return nextIds;
    });
  }, []);

  const rows = useMemo(
    () =>
      (decksQuery.result ?? []).map((deck) =>
        mapDeckToLibraryRow(deck, stagedSelectedIds),
      ),
    [decksQuery.result, stagedSelectedIds],
  );

  const filteredRows = useMemo(
    () => filterDeckLibraryRows(rows, searchText),
    [rows, searchText],
  );

  function handleConfirm() {
    const selectedItems = (decksQuery.result ?? [])
      .filter((deck) => stagedSelectedIds.has(deck.id))
      .map(mapDeckToSearchResult);

    onConfirm(selectedItems);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
        style={{ maxHeight: 'min(90vh, 680px)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6">
          <h2 className="text-lg font-semibold text-ink-heading">
            Browse decks
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Select every deck this card should appear in.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <DeckLibraryPickerGrid
            rows={filteredRows}
            searchText={searchText}
            isLoading={decksQuery.isLoading}
            errorMessage={decksQuery.error?.message}
            onSearchChange={setSearchText}
            onToggleDeck={handleToggleDeck}
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 border-t border-line px-6 py-4">
          <Button
            onClick={onCancel}
            className="rounded-[5px] border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-soft"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover"
          >
            Apply decks
          </Button>
        </div>
      </div>
    </div>
  );
}
