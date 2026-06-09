'use client';

import type { ImageAudioPracticeCardFields } from '@features/reviews';

import KidsPracticeAudio from './KidsPracticeAudio';
import KidsPracticeImage from './KidsPracticeImage';

interface KidsPracticeCardProps {
  cardFields: ImageAudioPracticeCardFields;
}

export default function KidsPracticeCard({
  cardFields,
}: KidsPracticeCardProps) {
  return (
    <section className="rounded-[20px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_42%,#eff6ff_100%)] p-2 shadow-sm sm:rounded-[24px] sm:p-3">
      <div className="rounded-[18px] bg-white/90 p-2 shadow-inner sm:rounded-[22px] sm:p-3">
        <KidsPracticeImage
          key={cardFields.imageAsset.url}
          alt={cardFields.altText ?? cardFields.label}
          imageUrl={cardFields.imageAsset.url}
        />

        <div className="mt-2 text-center sm:mt-3">
          <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {cardFields.label}
          </p>
        </div>

        <KidsPracticeAudio
          key={cardFields.audioAsset.url}
          audioUrl={cardFields.audioAsset.url}
        />
      </div>
    </section>
  );
}
