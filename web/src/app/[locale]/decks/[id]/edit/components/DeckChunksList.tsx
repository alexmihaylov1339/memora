import type { CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import DeckChunkItem from './DeckChunkItem';

interface DeckChunksListProps {
  chunks: ChunkRecord[];
  cardsById: Map<string, CardRecord>;
  deleteError?: string;
  deletingChunkId?: string;
  onDeleteChunk: (chunkId: string) => void;
}

export default function DeckChunksList({
  chunks,
  cardsById,
  deleteError,
  deletingChunkId,
  onDeleteChunk,
}: DeckChunksListProps) {
  return (
    <ul className="space-y-3">
      {chunks.map((chunk) => (
        <DeckChunkItem
          key={chunk.id}
          chunk={chunk}
          cardsById={cardsById}
          deleteError={deleteError}
          deletingChunkId={deletingChunkId}
          onDeleteChunk={onDeleteChunk}
        />
      ))}
    </ul>
  );
}
