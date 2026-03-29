import { Link } from '@/i18n/navigation';
import { Translate } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';

export default function DecksPageHeader() {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />
      <Link
        href="/decks/new"
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
      >
        <Translate tKey={TRANSLATION_KEYS.decks.createButton} />
      </Link>
    </div>
  );
}
