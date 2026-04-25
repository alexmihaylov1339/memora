import { useMemo } from 'react';
import { Grid, type GridColumnDef } from '@shared/components';
import type { CardRecord } from '@features/decks';
import { getChunkCardPreview } from './chunkCreatePreview';

interface ChunkSelectedCardsGridProps {
  selectedCards: CardRecord[];
  onRemoveCard: (cardId: string) => void;
}

const FIELD_ORDER = 'order' as const;
const FIELD_KIND = 'kind' as const;
const FIELD_FRONT = 'front' as const;
const FIELD_BACK = 'back' as const;

interface SelectedChunkCardRow {
  id: string;
  order: number;
  kind: string;
  front: string;
  back?: string;
}

export default function ChunkSelectedCardsGrid({
  selectedCards,
  onRemoveCard,
}: ChunkSelectedCardsGridProps) {
  const rowData = useMemo<SelectedChunkCardRow[]>(
    () =>
      selectedCards.map((card, index) => {
        const preview = getChunkCardPreview(card);

        return {
          id: card.id,
          order: index + 1,
          kind: card.kind,
          front: preview.front,
          back: preview.back,
        };
      }),
    [selectedCards],
  );

  const columnDefs = useMemo<GridColumnDef<SelectedChunkCardRow>[]>(
    () => [
      { field: FIELD_ORDER, headerName: 'Order' },
      { field: FIELD_KIND, headerName: 'Kind' },
      { field: FIELD_FRONT, headerName: 'Front' },
      { field: FIELD_BACK, headerName: 'Back' },
    ],
    [],
  );

  if (selectedCards.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">No cards selected yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Search your cards and add them to build the chunk sequence.
        </p>
      </div>
    );
  }

  return (
    <Grid
      id="chunk-selected-cards-grid"
      rowData={rowData}
      columnDefs={columnDefs}
      emptyMessage="No cards selected."
      showQuickFilter={false}
      onRemove={(row) => onRemoveCard(row.id)}
    />
  );
}
