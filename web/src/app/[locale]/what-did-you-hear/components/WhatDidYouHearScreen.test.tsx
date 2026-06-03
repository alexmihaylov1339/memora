import { fireEvent, render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import type { WhatDidYouHearReadyRound } from '@features/reviews';
import WhatDidYouHearScreen from './WhatDidYouHearScreen';

const mockUseWhatDidYouHearScreen = jest.fn();

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
};

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

jest.mock('@features/reviews', () => ({
  useWhatDidYouHearScreen: (...args: unknown[]) =>
    mockUseWhatDidYouHearScreen(...args),
}));

jest.mock('@shared/components', () => ({
  Button: ({ children, isLoading: _isLoading, ...props }: MockButtonProps) => (
    <button {...props}>{children}</button>
  ),
  ErrorMessage: ({ message }: { message: string }) => <p>{message}</p>,
  PageLoader: () => <p>Loading...</p>,
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function buildAsset(path: string) {
  return {
    path,
    mimeType: path.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg',
    size: 100,
    url: `https://assets.test/${path}`,
  };
}

function buildReadyRound(): WhatDidYouHearReadyRound {
  return {
    deckId: 'deck-1',
    choiceCount: 4,
    eligibleCardCount: 2,
    sessionCards: [
      {
        cardId: 'card-1',
        label: 'Car',
        imageAsset: buildAsset('kids-images/car.jpg'),
        audioAsset: buildAsset('kids-audio/car.mp3'),
        quizTags: [],
      },
      {
        cardId: 'card-2',
        label: 'Bus',
        imageAsset: buildAsset('kids-images/bus.jpg'),
        audioAsset: buildAsset('kids-audio/bus.mp3'),
        quizTags: [],
      },
    ],
    targetCard: {
      cardId: 'card-1',
      label: 'Car',
      audioAsset: buildAsset('kids-audio/car.mp3'),
      quizTags: [],
    },
    choices: [
      {
        id: 'choice-card-1',
        cardId: 'card-1',
        imageAsset: buildAsset('kids-images/car.jpg'),
        isCorrect: true,
        isDisabled: false,
        label: null,
      },
      {
        id: 'choice-card-2',
        cardId: 'card-2',
        imageAsset: buildAsset('kids-images/bus.jpg'),
        isCorrect: false,
        isDisabled: false,
        label: null,
      },
      {
        id: 'placeholder-1',
        cardId: null,
        imageAsset: null,
        isCorrect: false,
        isDisabled: true,
        label: 'No image',
      },
    ],
  };
}

function renderReadyScreen(overrides: Record<string, unknown> = {}) {
  const readyRound = buildReadyRound();
  const handleChoiceSelect = jest.fn();
  const handleNextRound = jest.fn();

  mockUseWhatDidYouHearScreen.mockReturnValue({
    correctChoiceId: null,
    errorMessage: undefined,
    handleChoiceSelect,
    handleNextRound,
    isCorrectSubmitted: false,
    isLoading: false,
    isSubmittingResult: false,
    postCorrectState: null,
    readyRound,
    status: 'ready',
    wrongChoiceId: null,
    ...overrides,
  });

  render(<WhatDidYouHearScreen deckId="deck-1" />);

  return { handleChoiceSelect, handleNextRound, readyRound };
}

describe('WhatDidYouHearScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value: jest.fn(),
    });
  });

  it('renders the audio prompt, correct label, image choices, and disabled placeholders', () => {
    const { handleChoiceSelect, readyRound } = renderReadyScreen();

    expect(screen.getByText('What Did You Hear?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Play Sound' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Car')).toBeInTheDocument();

    const imageChoices = screen.getAllByRole('button', {
      name: 'Image choice',
    });
    expect(imageChoices).toHaveLength(2);
    fireEvent.click(imageChoices[1]);
    expect(handleChoiceSelect).toHaveBeenCalledWith(readyRound.choices[1]);

    const placeholder = screen.getByRole('button', { name: 'No image' });
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveTextContent('No image');
  });

  it('marks the active wrong choice without replacing the round', () => {
    renderReadyScreen({ wrongChoiceId: 'choice-card-2' });

    const wrongChoice = screen.getAllByRole('button', {
      name: 'Image choice',
    })[1];
    expect(wrongChoice).toHaveClass('border-rose-300');
  });

  it('shows the post-correct reward seam and advances on Next', () => {
    const { handleNextRound } = renderReadyScreen({
      correctChoiceId: 'choice-card-1',
      isCorrectSubmitted: true,
      postCorrectState: {
        cardId: 'card-1',
        nextRound: {
          status: 'not_enough_eligible_cards',
          eligibleCardCount: 1,
          minimumEligibleCardCount: 2,
          choiceCount: 4,
        },
        rewardSlotState: 'available',
      },
    });

    expect(screen.getByText('Nice listening.')).toBeInTheDocument();
    expect(
      document.querySelector('[data-reward-slot-state="available"]'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(handleNextRound).toHaveBeenCalledTimes(1);
  });
});
