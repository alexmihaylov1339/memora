import { APP_ROUTES } from '@shared/constants';
import DeckActionLink from './DeckActionLink';

interface DeckWorkspaceHeaderProps {
  deckId: string;
}

export default function DeckWorkspaceHeader({
  deckId,
}: DeckWorkspaceHeaderProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_65%)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create cards, assemble chunks, and keep this deck ready for the review flow.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <DeckActionLink
            href={{ pathname: '/cards/new', query: { deckId } }}
            variant="primary"
          >
            Add Card
          </DeckActionLink>

          <DeckActionLink href={{ pathname: '/chunks/new', query: { deckId } }}>
            Add Chunk
          </DeckActionLink>

          <DeckActionLink href={APP_ROUTES.review}>
            Start Review
          </DeckActionLink>
        </div>
      </div>
    </div>
  );
}
