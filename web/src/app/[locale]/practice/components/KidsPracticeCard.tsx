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
    <section className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_40%,#eff6ff_100%)] p-3 shadow-sm sm:rounded-[32px] sm:p-6">
      <div className="rounded-[24px] bg-white/90 p-3 shadow-inner sm:rounded-[28px] sm:p-6">
        <div className="overflow-hidden rounded-[20px] border-4 border-white bg-slate-100 shadow-md sm:rounded-[24px]">
          <img
            src={cardFields.imageAsset.url}
            alt={cardFields.altText ?? cardFields.label}
            className="h-[48vh] min-h-[17rem] w-full object-cover sm:h-[52vh] sm:min-h-72"
            loading="eager"
          />
        </div>

        <div className="mt-4 text-center sm:mt-5">
          <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {cardFields.label}
          </p>
        </div>

        <div className="mt-5 flex justify-center sm:mt-6">
          <Button
            className="min-h-20 w-full max-w-sm rounded-full bg-[linear-gradient(135deg,#f97316_0%,#fb7185_100%)] px-6 py-5 text-lg font-black text-white shadow-lg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:text-xl"
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

      <audio
        ref={audioElementRef}
        playsInline
        preload="metadata"
        src={cardFields.audioAsset.url}
      />
    </section>
  );
}
