import { useMemo } from 'react';

import { ErrorMessage, PageLoader } from '@shared/components';
import type { CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import DeckChunksList from './DeckChunksList';

interface DeckChunksPanelProps {
  cards?: CardRecord[];
  chunks?: ChunkRecord[];
  deleteError?: string;
  deletingChunkId?: string;
  isLoading: boolean;
  error?: string;
  onDeleteChunk: (chunkId: string) => void;
}

export default function DeckChunksPanel({
  cards,
  chunks,
  deleteError,
  deletingChunkId,
  isLoading,
  error,
  onDeleteChunk,
}: DeckChunksPanelProps) {
  const cardsById = useMemo(
    () => new Map((cards ?? []).map((card) => [card.id, card])),
    [cards],
  );

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Chunks</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ordered groups of cards that drive the chunk review flow.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {chunks?.length ?? 0} total
        </span>
      </div>

      {isLoading && <PageLoader />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && chunks && chunks.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">No chunks yet in this deck.</p>
          <p className="mt-1 text-sm text-slate-500">
            Once you group cards into chunks, they will appear here with their order and size.
          </p>
        </div>
      )}

      {!isLoading && !error && chunks && chunks.length > 0 && (
        <DeckChunksList
          chunks={chunks}
          cardsById={cardsById}
          deleteError={deleteError}
          deletingChunkId={deletingChunkId}
          onDeleteChunk={onDeleteChunk}
        />
      )}
    </section>
  );
}
