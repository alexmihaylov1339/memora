import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { WhatDidYouHearReadyRound } from '@features/reviews';
import WhatDidYouHearPrompt from './WhatDidYouHearPrompt';

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

jest.mock('@shared/components', () => ({
  Button: ({ children, ...props }: MockButtonProps) => (
    <button {...props}>{children}</button>
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

function buildRound(cardId: string, label: string): WhatDidYouHearReadyRound {
  const audioPath = `kids-audio/${cardId}.mp3`;

  return {
    deckId: 'deck-1',
    choiceCount: 2,
    eligibleCardCount: 2,
    sessionCards: [
      {
        cardId,
        label,
        imageAsset: buildAsset(`kids-images/${cardId}.jpg`),
        audioAsset: buildAsset(audioPath),
        quizTags: [],
      },
      {
        cardId: 'other-card',
        label: 'Other',
        imageAsset: buildAsset('kids-images/other-card.jpg'),
        audioAsset: buildAsset('kids-audio/other-card.mp3'),
        quizTags: [],
      },
    ],
    targetCard: {
      cardId,
      label,
      audioAsset: buildAsset(audioPath),
      quizTags: [],
    },
    choices: [],
  };
}

describe('WhatDidYouHearPrompt', () => {
  const play = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    play.mockResolvedValue(undefined);
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: play,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value: jest.fn(),
    });
  });

  it('plays the target audio once when a new round opens', async () => {
    const { container, rerender } = render(
      <WhatDidYouHearPrompt round={buildRound('card-1', 'Car')} />,
    );
    const firstAudio = container.querySelector('audio');
    if (!firstAudio) {
      throw new Error('Expected prompt audio element');
    }

    fireEvent.canPlay(firstAudio);
    await waitFor(() => {
      expect(play).toHaveBeenCalledTimes(1);
    });

    rerender(<WhatDidYouHearPrompt round={buildRound('card-2', 'Bus')} />);
    const secondAudio = container.querySelector('audio');
    if (!secondAudio) {
      throw new Error('Expected prompt audio element');
    }

    fireEvent.canPlay(secondAudio);
    await waitFor(() => {
      expect(play).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps replay available while autoplay is attempted', async () => {
    render(<WhatDidYouHearPrompt round={buildRound('card-1', 'Car')} />);

    expect(
      screen.getByRole('button', { name: 'Play Sound' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play Sound' }));
    await waitFor(() => {
      expect(play).toHaveBeenCalled();
    });
  });

  it('keeps Play Sound visible when the first autoplay is blocked', async () => {
    play.mockRejectedValueOnce(new Error('autoplay blocked'));
    const { container } = render(
      <WhatDidYouHearPrompt round={buildRound('card-1', 'Car')} />,
    );
    const audio = container.querySelector('audio');
    if (!audio) {
      throw new Error('Expected prompt audio element');
    }

    fireEvent.canPlay(audio);

    await waitFor(() => {
      expect(play).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole('button', { name: 'Play Sound' }),
    ).toBeInTheDocument();
  });
});
