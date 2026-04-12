import { useMemo } from 'react';

import { Grid, type GridColumnDef } from '@shared/components';
import type { SearchResultItem } from '@features/search';

interface DeckSelectedItemsGridProps {
  id: string;
  items: SearchResultItem[];
  labelHeader: string;
  descriptionHeader: string;
  emptyMessage: string;
  onRemove: (item: SearchResultItem) => void;
}

export default function DeckSelectedItemsGrid({
  id,
  items,
  labelHeader,
  descriptionHeader,
  emptyMessage,
  onRemove,
}: DeckSelectedItemsGridProps) {
  const columnDefs = useMemo<GridColumnDef<SearchResultItem>[]>(
    () => [
      { field: 'label', headerName: labelHeader },
      { field: 'description', headerName: descriptionHeader },
    ],
    [labelHeader, descriptionHeader],
  );

  return (
    <Grid
      id={id}
      rowData={items}
      columnDefs={columnDefs}
      emptyMessage={emptyMessage}
      showQuickFilter={false}
      onRemove={onRemove}
    />
  );
}
