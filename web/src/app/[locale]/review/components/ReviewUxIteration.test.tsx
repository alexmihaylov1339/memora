import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { REVIEW_UNSUPPORTED_REASONS } from '@features/reviews/types';
import ReviewCurrentItemCard from './ReviewCurrentItemCard';
import ReviewEmptyState from './ReviewEmptyState';
import ReviewFeedbackBanner from './ReviewFeedbackBanner';
import ReviewUnsupportedCard from './ReviewUnsupportedCard';

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

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    className,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

const reviewItem = {
  cardId: 'card-1',
  deckId: 'deck-1',
  chunkId: 'chunk-1',
  chunkTitle: 'German verbs',
  chunkPosition: 0,
  positionInChunk: 2,
  due: '2026-04-26T10:00:00.000Z',
  kind: 'cloze_text',
  fields: { text: 'Ich {{c1::spiele}}.', answer: 'spiele' },
  isReviewSupported: false,
  reviewUnsupportedReason: REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
  consecutiveSuccessCount: 4,
};

describe('review UX iteration states', () => {
  it('keeps the active review card free of scheduling metadata labels', () => {
    render(
      <ReviewCurrentItemCard
        reviewRenderer={{
          renderer: 'basic',
          basicCardFields: { front: 'spielen', back: 'to play' },
        }}
        isAnswerRevealed={false}
        onRevealAnswer={jest.fn()}
      />,
    );

    expect(screen.getByText('spielen')).toBeInTheDocument();
    expect(screen.queryByText('Chunk')).not.toBeInTheDocument();
    expect(screen.queryByText('Deck Inbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/Queue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chunk card/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Due now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Streak/i)).not.toBeInTheDocument();
  });

  it('renders cloze text cards with the answer hidden until reveal', async () => {
    const user = userEvent.setup();
    const onRevealAnswer = jest.fn();

    render(
      <ReviewCurrentItemCard
        reviewRenderer={{
          renderer: 'cloze_text',
          clozeTextCardFields: {
            prompt: 'Ich _____ gern Tennis.',
            answer: 'spiele',
            hint: 'verb',
          },
        }}
        isAnswerRevealed={false}
        onRevealAnswer={onRevealAnswer}
      />,
    );

    expect(screen.getByText('Ich _____ gern Tennis.')).toBeInTheDocument();
    expect(screen.getByText('Hint: verb')).toBeInTheDocument();
    expect(screen.getByText(/Reveal the answer when you want/i)).toBeInTheDocument();
    expect(screen.queryByText(/before grading the card/i)).not.toBeInTheDocument();
    expect(screen.queryByText('spiele')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reveal Answer' }));

    expect(onRevealAnswer).toHaveBeenCalledTimes(1);
  });

  it('keeps completion feedback focused on refresh without last-grade stats', () => {
    const onRefreshQueue = jest.fn();

    render(
      <ReviewEmptyState
        title="Review step complete"
        description="No next actionable item was returned. Refresh the queue to check for the next due review."
        actionLabel="Refresh Queue"
        onAction={onRefreshQueue}
      />,
    );

    expect(screen.getByText('Review step complete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh Queue' })).toBeInTheDocument();
    expect(screen.queryByText('Last grade')).not.toBeInTheDocument();
    expect(screen.queryByText('Next interval')).not.toBeInTheDocument();
  });

  it('keeps post-grade feedback free of interval and streak summaries', () => {
    render(
      <ReviewFeedbackBanner
        result={{
          cardId: 'card-1',
          grade: 'good',
          wasSuccessful: true,
          advanced: true,
          reset: false,
          previousConsecutiveSuccessCount: 0,
          consecutiveSuccessCount: 1,
          due: '2026-04-26T10:00:00.000Z',
          intervalHours: 8,
          chunk: {
            chunkId: 'chunk-1',
            deckId: 'deck-1',
            title: 'Deck Inbox',
            position: 0,
            due: '2026-04-26T10:00:00.000Z',
            isDue: false,
            consecutiveSuccessCount: 1,
            requiredConsecutiveSuccesses: 20,
            hasMastery: false,
            totalCards: 2,
            currentCard: null,
            lastGrade: 'good',
          },
          nextActionableItem: null,
        }}
      />,
    );

    expect(screen.getByText('Grade saved.')).toBeInTheDocument();
    expect(screen.queryByText(/Progress/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next review/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Streak/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Deck Inbox')).not.toBeInTheDocument();
  });

  it('shows unsupported reason details and exposes a refresh action', async () => {
    const user = userEvent.setup();
    const onRefreshQueue = jest.fn();

    render(
      <ReviewUnsupportedCard
        item={reviewItem}
        onRefreshQueue={onRefreshQueue}
        reason={REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled}
      />,
    );

    expect(screen.getByText('Kind not review-enabled')).toBeInTheDocument();
    expect(screen.queryByText('Queue')).not.toBeInTheDocument();
    expect(screen.queryByText('Streak')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Decks' })).toHaveAttribute(
      'href',
      '/decks',
    );

    await user.click(screen.getByRole('button', { name: 'Refresh Queue' }));

    expect(onRefreshQueue).toHaveBeenCalledTimes(1);
  });
});
