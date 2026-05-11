import { Link } from '@/i18n/navigation';

import { BackLinkButton, Button } from '@shared/components';

interface CardsToolbarProps {
  backHref: string;
  backLabel: string;
  createCardHref: string | { pathname: string; query?: Record<string, string> };
  isMoveContext: boolean;
  onImportClick: () => void;
}

export default function CardsToolbar({
  backHref,
  backLabel,
  createCardHref,
  isMoveContext,
  onImportClick,
}: CardsToolbarProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        {isMoveContext && (
          <BackLinkButton href={backHref}>{backLabel}</BackLinkButton>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!isMoveContext && (
          <Button
            onClick={onImportClick}
            className="rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
          >
            Import CSV
          </Button>
        )}
        <Link
          href={createCardHref}
          className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-hover"
        >
          Create Card
        </Link>
      </div>
    </div>
  );
}
