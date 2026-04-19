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
            Move existing cards/chunks into this deck or create new ones directly from the workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <DeckActionLink
            href={{ pathname: '/cards', query: { deckId } }}
            variant="primary"
          >
            Move Existing Card
          </DeckActionLink>

          <DeckActionLink href={{ pathname: '/cards/new', query: { deckId } }}>
            Create New Card
          </DeckActionLink>

          <DeckActionLink
            href={{ pathname: '/chunks', query: { deckId } }}
            variant="primary"
          >
            Move Existing Chunk
          </DeckActionLink>

          <DeckActionLink href={{ pathname: '/chunks/new', query: { deckId } }}>
            Create New Chunk
          </DeckActionLink>

          <DeckActionLink href={APP_ROUTES.review}>
            Start Review
          </DeckActionLink>
        </div>
      </div>
    </div>
  );
}
