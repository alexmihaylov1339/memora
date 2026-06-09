'use client';

import { useState } from 'react';

interface KidsPracticeImageProps {
  alt: string;
  imageUrl: string;
}

export default function KidsPracticeImage({
  alt,
  imageUrl,
}: KidsPracticeImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[16px] border-4 border-white bg-slate-100 shadow-md sm:rounded-[20px]">
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-400" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className={`h-[34vh] min-h-[12rem] max-h-[19rem] w-full object-cover transition-opacity duration-200 sm:h-[40vh] sm:max-h-[24rem] lg:h-[42vh] lg:max-h-[28rem] ${
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
        loading="eager"
        onError={() => setIsImageLoaded(true)}
        onLoad={() => setIsImageLoaded(true)}
      />
    </div>
  );
}
