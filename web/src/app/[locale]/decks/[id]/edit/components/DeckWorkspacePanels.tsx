import type { CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import DeckCardsPanel from './DeckCardsPanel';
import DeckChunksPanel from './DeckChunksPanel';
import DeckWorkspaceHeader from './DeckWorkspaceHeader';

interface DeckWorkspacePanelsProps {
  deckId: string;
  cards?: CardRecord[];
  chunks?: ChunkRecord[];
  cardsLoading: boolean;
  chunksLoading: boolean;
  cardsError?: string;
  chunksError?: string;
}

export default function DeckWorkspacePanels({
  deckId,
  cards,
  chunks,
  cardsLoading,
  chunksLoading,
  cardsError,
  chunksError,
}: DeckWorkspacePanelsProps) {
  return (
    <section className="space-y-6">
      <DeckWorkspaceHeader deckId={deckId} />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <DeckCardsPanel
          cards={cards}
          isLoading={cardsLoading}
          error={cardsError}
        />

        <DeckChunksPanel
          chunks={chunks}
          isLoading={chunksLoading}
          error={chunksError}
        />
      </div>
    </section>
  );
}
