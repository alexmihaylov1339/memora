'use client';

import { useEffect, useRef, useState } from 'react';

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
  const autoPlayedSourceUrlRef = useRef<string | null>(null);
  const [audioError, setAudioError] = useState<AudioErrorState | null>(null);
  const audioSourceUrl = round.targetCard.audioAsset.url;
  const audioErrorMessage =
    audioError?.sourceUrl === audioSourceUrl ? audioError.message : null;

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement || autoPlayedSourceUrlRef.current === audioSourceUrl) {
      return;
    }

    autoPlayedSourceUrlRef.current = audioSourceUrl;
    let isCancelled = false;

    const playOnce = () => {
      if (isCancelled) {
        return;
      }

      audioElement.currentTime = 0;
      void audioElement.play().catch(() => {
        // Some browsers block first-load unmuted autoplay; manual replay remains available.
      });
    };

    if (audioElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      window.setTimeout(playOnce, 0);
    } else {
      audioElement.addEventListener('canplay', playOnce, { once: true });
      audioElement.load();
    }

    return () => {
      isCancelled = true;
      audioElement.removeEventListener('canplay', playOnce);
    };
  }, [audioSourceUrl]);

  async function playCurrentAudio(options: { showError: boolean }) {
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      if (options.showError) {
        setAudioError({
          message: 'Audio is not ready yet. Try again.',
          sourceUrl: audioSourceUrl,
        });
      }
      return;
    }

    setAudioError(null);

    try {
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch {
      if (options.showError) {
        setAudioError({
          message: 'Audio could not play. Tap the button to try again.',
          sourceUrl: audioSourceUrl,
        });
      }
    }
  }

  function handleReplayAudio() {
    void playCurrentAudio({ showError: true });
  }

  return (
    <section className="rounded-[18px] border border-sky-100 bg-white p-3 text-center shadow-sm sm:p-4">
      <Button
        className="min-h-12 w-full max-w-xs rounded-full bg-[var(--primary)] px-5 py-3 text-base font-black text-white shadow-md transition hover:opacity-90 sm:min-h-14 sm:text-lg"
        onClick={handleReplayAudio}
        type="button"
      >
        Play Sound
      </Button>

      <p className="mt-2 text-2xl font-black text-slate-950 sm:text-4xl">
        {round.targetCard.label}
      </p>

      {audioErrorMessage && (
        <p className="mt-3 text-sm font-semibold text-rose-600">
          {audioErrorMessage}
        </p>
      )}

      <audio
        autoPlay
        ref={audioElementRef}
        playsInline
        preload="auto"
        src={audioSourceUrl}
      />
    </section>
  );
}
