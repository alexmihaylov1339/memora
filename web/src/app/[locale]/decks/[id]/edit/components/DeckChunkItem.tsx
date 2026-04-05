import { Button } from '@shared/components';
import type { CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import { getChunkCardLabel } from './deckChunkPreview';

const USER_VISIBLE_POSITION_OFFSET = 1;
const SINGULAR_CARD_COUNT = 1;

interface DeckChunkItemProps {
  chunk: ChunkRecord;
  cardsById: Map<string, CardRecord>;
  deleteError?: string;
  deletingChunkId?: string;
  onDeleteChunk: (chunkId: string) => void;
}

export default function DeckChunkItem({
  chunk,
  cardsById,
  deleteError,
  deletingChunkId,
  onDeleteChunk,
}: DeckChunkItemProps) {
  const isDeleting = deletingChunkId === chunk.id;

  return (
    <li className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{chunk.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            Position {chunk.position + USER_VISIBLE_POSITION_OFFSET} • {chunk.cardIds.length}{' '}
            card{chunk.cardIds.length === SINGULAR_CARD_COUNT ? '' : 's'}
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500">{chunk.id}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chunk.cardIds.map((cardId, index) => (
          <span
            key={`${chunk.id}-${cardId}`}
            className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600"
          >
            #{index + USER_VISIBLE_POSITION_OFFSET} {getChunkCardLabel(cardId, cardsById)}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          isLoading={isDeleting}
          onClick={() => onDeleteChunk(chunk.id)}
          className="rounded-md border border-[var(--destructive)] px-3 py-1.5 text-sm text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete Chunk
        </Button>

        {deleteError && isDeleting && (
          <p className="text-sm text-[var(--destructive)]">{deleteError}</p>
        )}
      </div>
    </li>
  );
}
