import { Button } from '@shared/components';
import type { CardRecord } from '@features/decks';
import { USER_VISIBLE_POSITION_OFFSET } from './chunkCardSelectionConstants';
import { getChunkCardPreview } from './chunkCreatePreview';

interface ChunkSelectedCardItemProps {
  card: CardRecord;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
}

export default function ChunkSelectedCardItem({
  card,
  index,
  isFirst,
  isLast,
  onMoveCard,
  onRemoveCard,
}: ChunkSelectedCardItemProps) {
  const preview = getChunkCardPreview(card);

  return (
    <li className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            #{index + USER_VISIBLE_POSITION_OFFSET}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs uppercase tracking-wide text-slate-600">
            {card.kind}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-500">{card.id}</span>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-slate-900">{preview.front}</p>
        {preview.back && <p className="text-sm text-slate-600">{preview.back}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveCard(card.id, -1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Move Up
        </Button>
        <Button
          type="button"
          disabled={isLast}
          onClick={() => onMoveCard(card.id, 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Move Down
        </Button>
        <Button
          type="button"
          onClick={() => onRemoveCard(card.id)}
          className="rounded-md border border-[var(--destructive)] px-3 py-1.5 text-sm text-[var(--destructive)]"
        >
          Remove
        </Button>
      </div>
    </li>
  );
}
