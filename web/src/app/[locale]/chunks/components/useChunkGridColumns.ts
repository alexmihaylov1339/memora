import { useMemo } from 'react';
import type { GridColumnDef } from '@shared/components';
import type { ChunkRecord } from '@features/chunks';

export default function useChunkGridColumns(): GridColumnDef<ChunkRecord>[] {
  return useMemo(
    () => [
      { field: 'title', headerName: 'Title' },
      {
        headerName: 'Cards',
        valueGetter: (chunk) => chunk.cardIds.length,
      },
      {
        headerName: 'Position',
        valueGetter: (chunk) => chunk.position,
      },
    ],
    [],
  );
}
