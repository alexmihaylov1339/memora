import { BackLinkButton } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { DeckPresentationMode } from '@features/decks';
import { Link } from '@/i18n/navigation';

interface EditDeckHeaderProps {
  deckId?: string;
  deckName?: string;
  isPublic?: boolean;
  presentationMode?: DeckPresentationMode;
  isWhatDidYouHearEligible?: boolean;
  whatDidYouHearEligibleCardCount?: number;
}

export default function EditDeckHeader({
  deckId,
  deckName,
  isPublic = false,
  presentationMode = 'standard',
  isWhatDidYouHearEligible = false,
  whatDidYouHearEligibleCardCount = 0,
}: EditDeckHeaderProps) {
  const primaryActionHref =
    presentationMode === 'kids' && deckId
      ? APP_ROUTES.deckPractice(deckId)
      : deckId
        ? APP_ROUTES.deckReview(deckId)
        : undefined;
  const primaryActionLabel =
    presentationMode === 'kids' ? 'Open Kids Mode' : 'Review Due Cards';

  return (
    <header className="mx-auto mb-8 w-full max-w-[621px]">
      <h1 className="text-center text-4xl font-semibold text-ink-strong">Edit Deck</h1>
      <p className="mt-2 text-center text-lg font-semibold text-brand-accent">
        {deckName ? `${deckName} is ready for practice and sharing.` : 'A deck is just a promise to yourself. Keep it.'}
      </p>

      {deckId && (
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                presentationMode === 'kids'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {presentationMode === 'kids' ? 'Kids mode' : 'Standard mode'}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                isPublic
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPublic ? 'Public deck' : 'Private deck'}
            </span>
            {isWhatDidYouHearEligible && (
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                What Did You Hear? ready
              </span>
            )}
          </div>
          {!isWhatDidYouHearEligible && (
            <p className="mt-3 text-center text-sm text-slate-600">
              What Did You Hear? appears after this deck has at least 2 image-audio cards. Current eligible cards: {whatDidYouHearEligibleCardCount}.
            </p>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {primaryActionHref && (
              <Link
                href={primaryActionHref}
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                {primaryActionLabel}
              </Link>
            )}

            {isWhatDidYouHearEligible && (
              <Link
                href={APP_ROUTES.deckWhatDidYouHear(deckId)}
                className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
              >
                What Did You Hear?
              </Link>
            )}

            <Link
              href={APP_ROUTES.publicDecks}
              className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Browse Public Decks
            </Link>
          </div>
        </div>
      )}

      <div className="mt-5">
        <BackLinkButton href={APP_ROUTES.decks}>
          Back to Decks
        </BackLinkButton>
      </div>
    </header>
  );
}
