'use client';

import { useEffect, useRef, useState } from 'react';

import type { ImageAudioPracticeCardFields } from '@features/reviews';
import { Button } from '@shared/components';

interface KidsPracticeCardProps {
  cardFields: ImageAudioPracticeCardFields;
}

export default function KidsPracticeCard({
  cardFields,
}: KidsPracticeCardProps) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioErrorMessage, setAudioErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      return;
    }

    if (!audioElement.paused) {
      audioElement.currentTime = 0;
    }
    setAudioErrorMessage(null);
  }, [cardFields.audioAsset.url]);

  async function handlePlayAudio() {
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      setAudioErrorMessage('Audio is not ready yet. Try again.');
      return;
    }

    setAudioErrorMessage(null);

    try {
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch {
      setAudioErrorMessage('Audio could not play. Tap the button to try again.');
    }
  }

  return (
    <section className="rounded-[32px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_40%,#eff6ff_100%)] p-4 shadow-sm sm:p-6">
      <div className="rounded-[28px] bg-white/90 p-4 shadow-inner sm:p-6">
        <div className="overflow-hidden rounded-[24px] border-4 border-white bg-slate-100 shadow-md">
          <img
            src={cardFields.imageAsset.url}
            alt={cardFields.altText ?? cardFields.label}
            className="h-[52vh] min-h-72 w-full object-cover"
          />
        </div>

        <div className="mt-5 text-center">
          <p className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {cardFields.label}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            className="min-h-20 rounded-full bg-[linear-gradient(135deg,#f97316_0%,#fb7185_100%)] px-8 py-5 text-xl font-black text-white shadow-lg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handlePlayAudio()}
            type="button"
          >
            Play Sound
          </Button>
        </div>

        {audioErrorMessage && (
          <p className="mt-4 text-center text-sm font-medium text-rose-600">
            {audioErrorMessage}
          </p>
        )}
      </div>

      <audio ref={audioElementRef} preload="metadata" src={cardFields.audioAsset.url} />
    </section>
  );
}
