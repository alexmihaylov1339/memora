import { ErrorMessage, PageLoader } from '@shared/components';
import type { ChunkRecord } from '@features/chunks';

const USER_VISIBLE_POSITION_OFFSET = 1;
const SINGULAR_CARD_COUNT = 1;

interface DeckChunksPanelProps {
  chunks?: ChunkRecord[];
  isLoading: boolean;
  error?: string;
}

export default function DeckChunksPanel({
  chunks,
  isLoading,
  error,
}: DeckChunksPanelProps) {
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
        <ul className="space-y-3">
          {chunks.map((chunk) => (
            <li
              key={chunk.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-slate-900">{chunk.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Position {chunk.position + USER_VISIBLE_POSITION_OFFSET} •{' '}
                    {chunk.cardIds.length} card
                    {chunk.cardIds.length === SINGULAR_CARD_COUNT ? '' : 's'}
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
                    #{index + USER_VISIBLE_POSITION_OFFSET} {cardId}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
