'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@shared/components';
import type { SearchResultItem } from '@features/search';
import { TRANSLATION_KEYS } from '@/i18n';

import { useCardsListQuery } from '../hooks';
import {
  filterCardLibraryRows,
  mapCardToLibraryRow,
  mapCardToSearchResult,
} from './cardLibraryPickerHelpers';
import CardLibraryPickerGrid from './CardLibraryPickerGrid';

interface CardLibraryPickerProps {
  isOpen: boolean;
  selectedCards: SearchResultItem[];
  onCancel: () => void;
  onConfirm: (items: SearchResultItem[]) => void;
}

export default function CardLibraryPicker({
  isOpen,
  selectedCards,
  onCancel,
  onConfirm,
}: CardLibraryPickerProps) {
  const t = useTranslations();
  const cardsQuery = useCardsListQuery({ enabled: isOpen });
  const [searchText, setSearchText] = useState('');
  const [stagedSelectedIds, setStagedSelectedIds] = useState<Set<string>>(
    () => new Set(selectedCards.map((card) => card.id)),
  );

  const rows = useMemo(() => {
    const selectedIds = stagedSelectedIds;

    return (cardsQuery.result ?? []).map((card) =>
      mapCardToLibraryRow(card, selectedIds, (deckCount) =>
        deckCount === 0
          ? t(TRANSLATION_KEYS.cards.unassigned)
          : t(TRANSLATION_KEYS.cards.deckMembershipCount, {
              count: deckCount,
            }),
      ),
    );
  }, [cardsQuery.result, stagedSelectedIds, t]);

  const filteredRows = useMemo(
    () => filterCardLibraryRows(rows, searchText),
    [rows, searchText],
  );

  const handleToggleCard = useCallback((cardId: string) => {
    setStagedSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(cardId)) {
        nextIds.delete(cardId);
      } else {
        nextIds.add(cardId);
      }

      return nextIds;
    });
  }, []);

  function handleConfirm() {
    const selectedItems = (cardsQuery.result ?? [])
      .filter((card) => stagedSelectedIds.has(card.id))
      .map(mapCardToSearchResult);

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
        className="flex w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl"
        style={{ maxHeight: 'min(90vh, 720px)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6">
          <h2 className="text-lg font-semibold text-ink-heading">
            {t(TRANSLATION_KEYS.cards.browseCards)}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t(TRANSLATION_KEYS.cards.browseCardsDescription)}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <CardLibraryPickerGrid
            rows={filteredRows}
            searchText={searchText}
            isLoading={cardsQuery.isLoading}
            errorMessage={cardsQuery.error?.message}
            onSearchChange={setSearchText}
            onToggleCard={handleToggleCard}
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 border-t border-line px-6 py-4">
          <Button
            onClick={onCancel}
            className="rounded-[5px] border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-soft"
          >
            {t(TRANSLATION_KEYS.common.cancel)}
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover"
          >
            {t(TRANSLATION_KEYS.cards.addSelectedCards)}
          </Button>
        </div>
      </div>
    </div>
  );
}
