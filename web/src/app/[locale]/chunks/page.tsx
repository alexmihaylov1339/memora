'use client';

import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import {
  Button,
  EntitySearch,
  ErrorMessage,
  Grid,
  type GridColumnDef,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { ChunkRecord } from '@features/chunks';
import {
  chunkService,
  useChunksListQuery,
  useDeckMovableChunksQuery,
  useMoveDeckChunksMutation,
} from '@features/chunks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import useChunkGridColumns from './components/useChunkGridColumns';

export default function ChunksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdFromQuery = searchParams?.get('deckId')?.trim() ?? '';
  const isMoveContext = deckIdFromQuery.length > 0;

  const allChunksQuery = useChunksListQuery({
    enabled: !isMoveContext,
  });
  const movableChunksQuery = useDeckMovableChunksQuery(deckIdFromQuery, {
    enabled: isMoveContext,
  });
  const moveChunksMutation = useMoveDeckChunksMutation({
    onSuccess: () => {
      void movableChunksQuery.refetch();
    },
  });

  const isLoading = isMoveContext
    ? movableChunksQuery.isLoading
    : allChunksQuery.isLoading;
  const error = isMoveContext ? movableChunksQuery.error : allChunksQuery.error;
  const result = isMoveContext ? movableChunksQuery.result : allChunksQuery.result;
  const baseColumnDefs = useChunkGridColumns();

  function handleChunkSelect(id: string) {
    router.replace(APP_ROUTES.chunkEdit(id));
  }

  async function handleMoveChunk(chunkId: string) {
    if (!deckIdFromQuery) {
      return;
    }

    await moveChunksMutation.fetch({
      deckId: deckIdFromQuery,
      chunkIds: [chunkId],
    });
  }

  function handleChunkRowClick(chunk: ChunkRecord) {
    if (isMoveContext) {
      return;
    }

    handleChunkSelect(chunk.id);
  }

  const columnDefs: GridColumnDef<ChunkRecord>[] = isMoveContext
    ? [
        ...baseColumnDefs,
        {
          headerName: 'Actions',
          searchable: false,
          cellRenderer: (chunk) => (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleMoveChunk(chunk.id);
              }}
              className="rounded-md bg-[#1d6fa5] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#165984]"
            >
              Move to Deck
            </Button>
          ),
        },
      ]
    : baseColumnDefs;

  const pageTitle = isMoveContext ? 'Move Chunks to Deck' : 'Chunks';
  const backHref = isMoveContext
    ? APP_ROUTES.deckEdit(deckIdFromQuery)
    : APP_ROUTES.decks;
  const backLabel = isMoveContext ? 'Back to Deck Workspace' : 'Back to Decks';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">{pageTitle}</h1>

        <div className="mb-4">
          <Link
            href={backHref}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {backLabel}
          </Link>
        </div>

        {!isMoveContext && (
          <EntitySearch
            queryKey={SEARCH_QUERY_KEYS.chunk}
            search={chunkService.search}
            placeholder="Search chunks"
            onSelect={(item) => handleChunkSelect(item.id)}
          />
        )}

        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {moveChunksMutation.error && (
          <ErrorMessage message={moveChunksMutation.error.message} />
        )}
        {result && (
          <Grid
            id="chunks-grid"
            rowData={result}
            columnDefs={columnDefs}
            onRowClick={isMoveContext ? undefined : handleChunkRowClick}
            quickFilterPlaceholder="Filter chunk rows"
            emptyMessage={
              isMoveContext
                ? 'No movable chunks available.'
                : 'No chunks found.'
            }
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
