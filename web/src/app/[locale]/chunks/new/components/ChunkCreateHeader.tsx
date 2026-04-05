import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface ChunkCreateHeaderProps {
  deckId: string;
}

export default function ChunkCreateHeader({
  deckId,
}: ChunkCreateHeaderProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Create Chunk</h1>

      <div className="mb-4">
        <Link
          href={deckId ? APP_ROUTES.deckEdit(deckId) : APP_ROUTES.decks}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          Back
        </Link>
      </div>
    </>
  );
}
