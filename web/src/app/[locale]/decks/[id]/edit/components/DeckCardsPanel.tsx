import { Link } from '@/i18n/navigation';

import { ErrorMessage, PageLoader } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { CardRecord } from '@features/decks';
import { getCardPreview } from './deckWorkspacePreview';

interface DeckCardsPanelProps {
  cards?: CardRecord[];
  isLoading: boolean;
  error?: string;
}

export default function DeckCardsPanel({
  cards,
  isLoading,
  error,
}: DeckCardsPanelProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cards</h2>
          <p className="mt-1 text-sm text-slate-600">
            Existing cards in this deck that can be reused in chunks.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {cards?.length ?? 0} total
        </span>
      </div>

      {isLoading && <PageLoader />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && cards && cards.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">No cards yet in this deck.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add a few cards first so chunk authoring has something to work with.
          </p>
        </div>
      )}

      {!isLoading && !error && cards && cards.length > 0 && (
        <ul className="space-y-3">
          {cards.map((card) => {
            const preview = getCardPreview(card);

            return (
              <li key={card.id}>
                <Link
                  href={APP_ROUTES.cardEdit(card.id)}
                  className="block rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {card.kind}
                      </span>
                      <span className="font-mono text-xs text-slate-500">{card.id}</span>
                    </div>
                    <span className="text-xs text-slate-500">Edit card</span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-slate-900">{preview.front}</p>
                    {preview.back && (
                      <p className="text-sm text-slate-600">{preview.back}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
