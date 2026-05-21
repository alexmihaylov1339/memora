import { render, screen } from '@testing-library/react';

import {
  resolvePracticeRenderer,
  usePracticeScreen,
} from '@features/reviews';
import KidsPracticeScreen from './KidsPracticeScreen';

jest.mock('@features/reviews', () => ({
  resolvePracticeRenderer: jest.fn(),
  usePracticeScreen: jest.fn(),
}));

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  PageLoader: () => <div>loading</div>,
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockedUsePracticeScreen = usePracticeScreen as jest.MockedFunction<
  typeof usePracticeScreen
>;
const mockedResolvePracticeRenderer =
  resolvePracticeRenderer as jest.MockedFunction<typeof resolvePracticeRenderer>;

describe('KidsPracticeScreen', () => {
  beforeEach(() => {
    mockedUsePracticeScreen.mockReset();
    mockedResolvePracticeRenderer.mockReset();
  });

  it('renders the kids player for image_audio cards', () => {
    mockedUsePracticeScreen.mockReturnValue({
      currentItem: {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'Cars',
        chunkPosition: 0,
        positionInChunk: 0,
        kind: 'image_audio',
        fields: {},
        isReviewSupported: false,
        reviewUnsupportedReason: null,
      },
      errorMessage: undefined,
      hasNextItem: true,
      hasPreviousItem: false,
      isAnswerRevealed: false,
      isLoading: false,
      positionLabel: '1 of 3',
      totalCount: 3,
      handleNextItem: jest.fn(),
      handlePreviousItem: jest.fn(),
      handleRevealAnswer: jest.fn(),
    });
    mockedResolvePracticeRenderer.mockReturnValue({
      renderer: 'image_audio',
      imageAudioCardFields: {
        label: 'Car',
        altText: 'Red car',
        imageAsset: {
          path: 'kids-images/user-1/card-1/car.jpg',
          mimeType: 'image/jpeg',
          size: 128,
          url: 'https://cdn.example.com/car.jpg',
        },
        audioAsset: {
          path: 'kids-audio/user-1/card-1/car.mp3',
          mimeType: 'audio/mpeg',
          size: 256,
          url: 'https://cdn.example.com/car.mp3',
        },
      },
    });

    render(<KidsPracticeScreen deckId="deck-1" />);

    expect(screen.getByText('Kids mode')).toBeInTheDocument();
    expect(screen.getByText('Picture practice')).toBeInTheDocument();
    expect(screen.getByText('Car')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play Sound' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('falls back to the unsupported state for non-image cards', () => {
    mockedUsePracticeScreen.mockReturnValue({
      currentItem: {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'Cars',
        chunkPosition: 0,
        positionInChunk: 0,
        kind: 'basic',
        fields: { front: 'car', back: 'car' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
      },
      errorMessage: undefined,
      hasNextItem: false,
      hasPreviousItem: false,
      isAnswerRevealed: false,
      isLoading: false,
      positionLabel: '1 of 1',
      totalCount: 1,
      handleNextItem: jest.fn(),
      handlePreviousItem: jest.fn(),
      handleRevealAnswer: jest.fn(),
    });
    mockedResolvePracticeRenderer.mockReturnValue({
      renderer: 'basic',
      basicCardFields: { front: 'car', back: 'car' },
    });

    render(<KidsPracticeScreen deckId="deck-1" />);

    expect(screen.getByText('Unsupported practice card')).toBeInTheDocument();
  });
});
