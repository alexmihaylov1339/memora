'use client';

import { useRef, useState } from 'react';

import type { WhatDidYouHearReadyRound } from '@features/reviews';
import { Button } from '@shared/components';

interface WhatDidYouHearPromptProps {
  round: WhatDidYouHearReadyRound;
}

interface AudioErrorState {
  message: string;
  sourceUrl: string;
}

export default function WhatDidYouHearPrompt({
  round,
}: WhatDidYouHearPromptProps) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState<AudioErrorState | null>(null);
  const audioSourceUrl = round.targetCard.audioAsset.url;
  const audioErrorMessage =
    audioError?.sourceUrl === audioSourceUrl ? audioError.message : null;

  async function handleReplayAudio() {
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      setAudioError({
        message: 'Audio is not ready yet. Try again.',
        sourceUrl: audioSourceUrl,
      });
      return;
    }

    setAudioError(null);

    try {
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch {
      setAudioError({
        message: 'Audio could not play. Tap the button to try again.',
        sourceUrl: audioSourceUrl,
      });
    }
  }

  return (
    <section className="rounded-[24px] border border-sky-100 bg-white p-5 text-center shadow-sm sm:p-7">
      <Button
        className="min-h-16 w-full max-w-xs rounded-full bg-[var(--primary)] px-6 py-4 text-lg font-black text-white shadow-md transition hover:opacity-90"
        onClick={() => void handleReplayAudio()}
        type="button"
      >
        Play Sound
      </Button>

      <p className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">
        {round.targetCard.label}
      </p>

      {audioErrorMessage && (
        <p className="mt-3 text-sm font-semibold text-rose-600">
          {audioErrorMessage}
        </p>
      )}

      <audio
        ref={audioElementRef}
        playsInline
        preload="metadata"
        src={audioSourceUrl}
      />
    </section>
  );
}
