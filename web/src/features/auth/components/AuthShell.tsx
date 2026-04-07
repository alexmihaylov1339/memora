'use client';

import type { ReactNode } from 'react';
import { Roboto_Flex, Vibur } from 'next/font/google';

const vibur = Vibur({
  subsets: ['latin'],
  weight: '400',
});

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  weight: '400',
});

interface AuthShellProps {
  children: ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className={`${robotoFlex.className} min-h-screen bg-white px-6 py-10 sm:px-8`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[404px] items-center">
        <div className="w-full">
          <div className="mb-9 flex items-center gap-[8px]">
            <div
              className={`${vibur.className} flex h-[63px] w-[63px] items-center justify-center rounded-[12px] bg-[#1d6fa5] text-[64px] leading-none text-[#e6f1fb] shadow-none`}
            >
              m
            </div>
            <span
              className={`${vibur.className} translate-y-[-2px] text-[78px] leading-none tracking-[0.01em] text-[#1d6fa5] sm:text-[96px]`}
            >
              memora
            </span>
          </div>

          <p className="mb-10 text-[20px] font-bold leading-[20px] tracking-[0.01em] text-[rgba(1,1,1,0.75)]">
            From cards to memory
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
