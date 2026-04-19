import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@shared/constants';

interface CardsPageHeaderProps {
  description?: string;
  backHref?: string;
  backLabel?: string;
  title: string;
}

export default function CardsPageHeader({
  description,
  backHref = APP_ROUTES.decks,
  backLabel = 'Back to Decks',
  title,
}: CardsPageHeaderProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{title}</h1>
      {description && <p className="mb-4 text-sm text-slate-700">{description}</p>}

      <div className="mb-4">
        <Link href={backHref} className="text-sm text-[var(--primary)] hover:underline">
          {backLabel}
        </Link>
      </div>
    </>
  );
}
