import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface ChunkCreateEmptyDeckStateProps {
  activeDeckId: string;
}

export default function ChunkCreateEmptyDeckState({
  activeDeckId,
}: ChunkCreateEmptyDeckStateProps) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm text-slate-700">This deck has no cards yet.</p>
      <p className="mt-1 text-sm text-slate-500">
        Add cards first, then return here to assemble the chunk.
      </p>
      <Link
        href={{ pathname: APP_ROUTES.newCard, query: { deckId: activeDeckId } }}
        className="mt-4 inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Add Card
      </Link>
    </div>
  );
}
