import { useMemo } from 'react';
import { Button, Grid, type GridColumnDef } from '@shared/components';
import type { CardRecord } from '@features/decks';
import { getChunkCardPreview } from './chunkCreatePreview';

interface ChunkSelectedCardsGridProps {
  selectedCards: CardRecord[];
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
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
  isFirst: boolean;
  isLast: boolean;
}

export default function ChunkSelectedCardsGrid({
  selectedCards,
  onMoveCard,
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
          isFirst: index === 0,
          isLast: index === selectedCards.length - 1,
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
      {
        headerName: 'Actions',
        searchable: false,
        cellRenderer: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={row.isFirst}
              onClick={() => onMoveCard(row.id, -1)}
            >
              Move Up
            </Button>
            <Button
              type="button"
              disabled={row.isLast}
              onClick={() => onMoveCard(row.id, 1)}
            >
              Move Down
            </Button>
            <Button type="button" onClick={() => onRemoveCard(row.id)}>
              Remove
            </Button>
          </div>
        ),
      },
    ],
    [onMoveCard, onRemoveCard],
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
    />
  );
}
