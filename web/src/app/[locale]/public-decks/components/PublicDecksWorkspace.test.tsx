import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { useCopyPublicDeckMutation } from '@features/decks';
import PublicDecksWorkspace from './PublicDecksWorkspace';

const mockPush = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSuccess = jest.fn();

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('@shared/providers', () => ({
  useNotification: () => ({
    success: mockSuccess,
  }),
}));

jest.mock('@features/decks', () => ({
  DECKS_QUERY_KEYS: {
    all: ['decks'],
  },
  useCopyPublicDeckMutation: jest.fn(),
}));

const mockedUseCopyPublicDeckMutation =
  useCopyPublicDeckMutation as jest.MockedFunction<
    typeof useCopyPublicDeckMutation
  >;

describe('PublicDecksWorkspace', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockInvalidateQueries.mockReset();
    mockSuccess.mockReset();
    mockedUseCopyPublicDeckMutation.mockReset();
  });

  it('renders public decks and copies one into the users library', async () => {
    mockedUseCopyPublicDeckMutation.mockImplementation((options) => ({
      fetch: async () => {
        options?.onSuccess?.({
          id: 'copied-deck-1',
          name: 'Cars',
          presentationMode: 'kids',
          isPublic: false,
          reviewIntervalHours: [1, 24],
          createdAt: '2026-05-21T10:00:00.000Z',
          updatedAt: '2026-05-21T10:00:00.000Z',
        });
        return {
          id: 'copied-deck-1',
          name: 'Cars',
          presentationMode: 'kids',
          isPublic: false,
          reviewIntervalHours: [1, 24],
          createdAt: '2026-05-21T10:00:00.000Z',
          updatedAt: '2026-05-21T10:00:00.000Z',
        };
      },
      isLoading: false,
      isLoaded: false,
      error: null,
      result: undefined,
      reset: jest.fn(),
      trigger: jest.fn(),
    }));

    render(
      <PublicDecksWorkspace
        decks={[
          {
            id: 'deck-1',
            name: 'Cars',
            description: 'Picture deck',
            count: 6,
            presentationMode: 'kids',
            ownerDisplayName: 'Alex',
            ownerUserId: 'user-1',
            createdAt: '2026-05-21T10:00:00.000Z',
            updatedAt: '2026-05-21T11:00:00.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('1 kids decks ready to reuse.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add to my decks' }));

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith('Deck copied successfully.');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['decks'],
      });
      expect(mockPush).toHaveBeenCalledWith('/decks/copied-deck-1/edit');
    });
  });
});
