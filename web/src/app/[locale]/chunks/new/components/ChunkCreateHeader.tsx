import { BackLinkButton } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

interface ChunkCreateHeaderProps {
  deckId: string;
}

export default function ChunkCreateHeader({
  deckId,
}: ChunkCreateHeaderProps) {
  const hasDeckContext = Boolean(deckId.trim());
  const targetHref = hasDeckContext ? APP_ROUTES.deckEdit(deckId) : APP_ROUTES.chunks;
  const backLabel = hasDeckContext ? 'Back to Deck Workspace' : 'Back to Chunks';

  return (
    <header className="mx-auto mb-8 w-full max-w-[621px]">
      <h1 className="text-center text-4xl font-semibold text-ink-strong">
        Create Chunk
      </h1>

      <div className="mt-5">
        <BackLinkButton href={targetHref}>
          {backLabel}
        </BackLinkButton>
      </div>
    </header>
  );
}
