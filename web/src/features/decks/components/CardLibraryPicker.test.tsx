import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SearchResultItem } from '@features/search';

import type { CardRecord } from '../types';
import { useCardsListQuery } from '../hooks';
import CardLibraryPicker from './CardLibraryPicker';

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
      'cards.addSelectedCards': 'Add selected cards',
      'cards.back': 'Back',
      'cards.browseCards': 'Browse cards',
      'cards.browseCardsDescription':
        'Scan your card library and select cards for this deck.',
      'cards.deckColumn': 'Deck',
      'cards.deckMembershipCount': `${values?.count ?? 0} deck${
        values?.count === 1 ? '' : 's'
      }`,
      'cards.front': 'Front',
      'cards.loadingCards': 'Loading cards...',
      'cards.noCardsMatch': 'No cards match your search.',
      'cards.searchCards': 'Search cards',
      'cards.selectCard': `Select ${values?.label ?? ''}`,
      'cards.unassigned': 'Unassigned',
      'common.cancel': 'Cancel',
    };

    return translations[key] ?? key;
  },
}));

jest.mock('../hooks', () => ({
  useCardsListQuery: jest.fn(),
}));

const mockUseCardsListQuery = jest.mocked(useCardsListQuery);

const cards: CardRecord[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    deckIds: ['deck-1'],
    kind: 'basic',
    fields: { front: 'Alpha front', back: 'Alpha back' },
    createdAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'card-2',
    deckId: null,
    deckIds: [],
    kind: 'basic',
    fields: { front: 'Beta front', back: 'Beta back' },
    createdAt: '2026-05-01T11:00:00.000Z',
  },
];

const selectedCard: SearchResultItem = {
  id: 'card-1',
  type: 'card',
  label: 'Alpha front',
  description: 'Alpha back',
};

function renderPicker({
  selectedCards = [selectedCard],
  onCancel = jest.fn(),
  onConfirm = jest.fn(),
}: {
  selectedCards?: SearchResultItem[];
  onCancel?: () => void;
  onConfirm?: (items: SearchResultItem[]) => void;
} = {}) {
  mockUseCardsListQuery.mockReturnValue({
    isLoading: false,
    isLoaded: true,
    error: null,
    result: cards,
    refetch: jest.fn(),
    isRefetching: false,
  });

  render(
    <CardLibraryPicker
      isOpen
      selectedCards={selectedCards}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  );

  return { onCancel, onConfirm };
}

describe('CardLibraryPicker', () => {
  it('renders existing selected cards as checked', () => {
    renderPicker();

    expect(screen.getByRole('checkbox', { name: 'Select Alpha front' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Beta front' })).not.toBeChecked();
  });

  it('confirms staged selections', async () => {
    const { onConfirm } = renderPicker();

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select Beta front' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Add selected cards' }),
    );

    expect(onConfirm).toHaveBeenCalledWith([
      selectedCard,
      {
        id: 'card-2',
        type: 'card',
        label: 'Beta front',
        description: 'Beta back',
      },
    ]);
  });

  it('cancels without confirming staged selections', async () => {
    const { onCancel, onConfirm } = renderPicker();

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select Beta front' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms each selected card once', async () => {
    const { onConfirm } = renderPicker({
      selectedCards: [selectedCard, selectedCard],
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Add selected cards' }),
    );

    expect(onConfirm).toHaveBeenCalledWith([selectedCard]);
  });
});
