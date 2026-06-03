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
    <section className="rounded-[20px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_42%,#eff6ff_100%)] p-2 shadow-sm sm:rounded-[24px] sm:p-3">
      <div className="rounded-[18px] bg-white/90 p-2 shadow-inner sm:rounded-[22px] sm:p-3">
        <div className="overflow-hidden rounded-[16px] border-4 border-white bg-slate-100 shadow-md sm:rounded-[20px]">
          <img
            src={cardFields.imageAsset.url}
            alt={cardFields.altText ?? cardFields.label}
            className="h-[34vh] min-h-[12rem] max-h-[19rem] w-full object-cover sm:h-[40vh] sm:max-h-[24rem] lg:h-[42vh] lg:max-h-[28rem]"
            loading="eager"
          />
        </div>

        <div className="mt-2 text-center sm:mt-3">
          <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {cardFields.label}
          </p>
        </div>

        <div className="mt-3 flex justify-center sm:mt-4">
          <Button
            className="min-h-14 w-full max-w-xs rounded-full bg-[linear-gradient(135deg,#f97316_0%,#fb7185_100%)] px-5 py-3 text-base font-black text-white shadow-lg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-16 sm:px-6 sm:text-lg"
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
