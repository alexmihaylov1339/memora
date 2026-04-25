import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface ChunkCreateHeaderProps {
  deckId: string;
}

export default function ChunkCreateHeader({
  deckId,
}: ChunkCreateHeaderProps) {
  const hasDeckContext = Boolean(deckId.trim());

  return (
    <header className="mb-8">
      <h1 className="text-center text-4xl font-semibold text-ink-strong">
        Create Chunk
      </h1>

      <div className="mt-5">
        <Link
          href={hasDeckContext ? APP_ROUTES.deckEdit(deckId) : APP_ROUTES.decks}
          className="inline-flex items-center rounded-md border border-line bg-white px-3 py-1.5 text-sm text-[var(--primary)] transition hover:bg-slate-50"
        >
          {hasDeckContext ? 'Back to Deck Workspace' : 'Back to Decks'}
        </Link>
      </div>
    </header>
  );
}
