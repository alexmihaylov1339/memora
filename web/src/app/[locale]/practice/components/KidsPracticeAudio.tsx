'use client';

import { useRef, useState } from 'react';

import { Button } from '@shared/components';

interface KidsPracticeAudioProps {
  audioUrl: string;
}

export default function KidsPracticeAudio({
  audioUrl,
}: KidsPracticeAudioProps) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioErrorMessage, setAudioErrorMessage] = useState<string | null>(
    null,
  );

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
    <>
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
      <audio
        ref={audioElementRef}
        playsInline
        preload="metadata"
        src={audioUrl}
      />
    </>
  );
}
