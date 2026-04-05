import { Button } from '@shared/components';
import type { CardRecord } from '@features/decks';
import { getChunkCardPreview } from './chunkCreatePreview';

interface ChunkAvailableCardItemProps {
  card: CardRecord;
  onAddCard: (cardId: string) => void;
}

export default function ChunkAvailableCardItem({
  card,
  onAddCard,
}: ChunkAvailableCardItemProps) {
  const preview = getChunkCardPreview(card);

  return (
    <li className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-600">
          {card.kind}
        </span>
        <span className="font-mono text-xs text-slate-500">{card.id}</span>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-slate-900">{preview.front}</p>
        {preview.back && <p className="text-sm text-slate-600">{preview.back}</p>}
      </div>

      <Button
        type="button"
        onClick={() => onAddCard(card.id)}
        className="mt-4 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        Add to Chunk
      </Button>
    </li>
  );
}
