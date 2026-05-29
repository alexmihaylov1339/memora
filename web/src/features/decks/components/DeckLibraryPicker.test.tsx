import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SearchResultItem } from '@features/search';

import { useDecksListQuery } from '../hooks';
import type { Deck } from '../types';
import DeckLibraryPicker from './DeckLibraryPicker';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'cards.applyDecks': 'Apply decks',
      'cards.browseDecks': 'Browse decks',
      'cards.browseDecksDescription':
        'Select every deck this card should appear in.',
      'cards.deckColumn': 'Deck',
      'cards.loadingDecks': 'Loading decks...',
      'cards.noDecksMatch': 'No decks match your search.',
      'cards.searchDecks': 'Search decks',
      'cards.selectDeck': `Select ${values?.label ?? ''}`,
      'common.cancel': 'Cancel',
      'decks.cardsCount': 'cards',
    };

    return translations[key] ?? key;
  },
}));

jest.mock('../hooks', () => ({
  useDecksListQuery: jest.fn(),
}));

const mockUseDecksListQuery = jest.mocked(useDecksListQuery);

const decks: Deck[] = [
  {
    id: 'deck-1',
    name: 'Spanish',
    count: 12,
    dueCount: 3,
    presentationMode: 'standard',
    isPublic: false,
    isWhatDidYouHearEligible: false,
    whatDidYouHearEligibleCardCount: 0,
  },
  {
    id: 'deck-2',
    name: 'German',
    count: 5,
    dueCount: 0,
    presentationMode: 'kids',
    isPublic: true,
    isWhatDidYouHearEligible: true,
    whatDidYouHearEligibleCardCount: 2,
  },
];

const selectedDeck: SearchResultItem = {
  id: 'deck-1',
  type: 'deck',
  label: 'Spanish',
  description: '12 cards',
};

function renderPicker({
  selectedDecks = [selectedDeck],
  onCancel = jest.fn(),
  onConfirm = jest.fn(),
}: {
  selectedDecks?: SearchResultItem[];
  onCancel?: () => void;
  onConfirm?: (items: SearchResultItem[]) => void;
} = {}) {
  mockUseDecksListQuery.mockReturnValue({
    isLoading: false,
    isLoaded: true,
    error: null,
    result: decks,
    refetch: jest.fn(),
    isRefetching: false,
  });

  render(
    <DeckLibraryPicker
      isOpen
      selectedDecks={selectedDecks}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  );

  return { onCancel, onConfirm };
}

describe('DeckLibraryPicker', () => {
  it('renders existing selected decks as checked', () => {
    renderPicker();

    expect(screen.getByRole('checkbox', { name: 'Select Spanish' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select German' })).not.toBeChecked();
  });

  it('confirms staged selections', async () => {
    const { onConfirm } = renderPicker();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select German' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply decks' }));

    expect(onConfirm).toHaveBeenCalledWith([
      selectedDeck,
      {
        id: 'deck-2',
        type: 'deck',
        label: 'German',
        description: '5 cards',
      },
    ]);
  });

  it('cancels without confirming staged selections', async () => {
    const { onCancel, onConfirm } = renderPicker();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select German' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms each selected deck once', async () => {
    const { onConfirm } = renderPicker({
      selectedDecks: [selectedDeck, selectedDeck],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Apply decks' }));

    expect(onConfirm).toHaveBeenCalledWith([selectedDeck]);
  });
});
