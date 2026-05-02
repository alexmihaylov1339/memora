import { Vibur } from 'next/font/google';

const vibur = Vibur({
  subsets: ['latin'],
  weight: '400',
});

const brandLogoStyles = {
  auth: {
    root: 'flex items-center gap-[8px]',
    mark:
      'flex h-[63px] w-[63px] items-center justify-center rounded-[12px] bg-brand text-[64px] leading-none text-brand-contrast shadow-none',
    word:
      'translate-y-[-2px] text-[78px] leading-none tracking-[0.01em] text-brand sm:text-[96px]',
  },
  sidebar: {
    root: 'flex items-center gap-3',
    mark:
      'flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-brand text-[52px] leading-none text-brand-contrast',
    word:
      'translate-y-[-1px] text-[54px] leading-none tracking-[0.01em] text-brand',
  },
} as const;

type BrandLogoVariant = keyof typeof brandLogoStyles;

interface BrandLogoProps {
  className?: string;
  variant?: BrandLogoVariant;
}

export default function BrandLogo({
  className = '',
  variant = 'sidebar',
}: BrandLogoProps) {
  const styles = brandLogoStyles[variant];
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div aria-label="Memora" className={rootClassName} data-testid="brand-logo">
      <div
        aria-hidden="true"
        className={`${vibur.className} ${styles.mark}`}
        data-testid="brand-logo-mark"
      >
        m
      </div>
      <span
        className={`${vibur.className} ${styles.word}`}
        data-testid="brand-logo-word"
      >
        memora
      </span>
    </div>
  );
}
