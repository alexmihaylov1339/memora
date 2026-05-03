import { BackLinkButton } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

interface CardsPageHeaderProps {
  description?: string;
  backHref?: string;
  backLabel?: string;
  title: string;
}

export default function CardsPageHeader({
  description,
  backHref = APP_ROUTES.cards,
  backLabel = 'Back to Cards',
  title,
}: CardsPageHeaderProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{title}</h1>
      {description && <p className="mb-4 text-sm text-slate-700">{description}</p>}

      <div className="mb-4">
        <BackLinkButton href={backHref}>
          {backLabel}
        </BackLinkButton>
      </div>
    </>
  );
}
