import { Link } from '@/i18n/navigation';

interface DeckActionLinkProps {
  href:
    | string
    | {
        pathname: string;
        query?: Record<string, string>;
      };
  children: string;
  variant?: 'primary' | 'secondary';
}

const BASE_CLASS_NAME = 'rounded-md px-4 py-2 text-sm';
const VARIANT_CLASS_NAMES = {
  primary: 'bg-[var(--primary)] font-medium text-white hover:opacity-90',
  secondary: 'border border-[var(--border)] bg-white hover:bg-slate-50',
} as const;

export default function DeckActionLink({
  href,
  children,
  variant = 'secondary',
}: DeckActionLinkProps) {
  return (
    <Link
      href={href}
      className={`${BASE_CLASS_NAME} ${VARIANT_CLASS_NAMES[variant]}`}
    >
      {children}
    </Link>
  );
}
