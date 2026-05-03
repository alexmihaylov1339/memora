import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

const BACK_LINK_BUTTON_CLASS =
  'inline-flex items-center rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition hover:bg-slate-50';

interface BackLinkButtonProps {
  children: ReactNode;
  className?: string;
  href: ComponentProps<typeof Link>['href'];
}

export default function BackLinkButton({
  children,
  className = '',
  href,
}: BackLinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${BACK_LINK_BUTTON_CLASS} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
