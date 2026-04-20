'use client';

import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import {
  Button,
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
  const pageDescription = isMoveContext
    ? 'Select existing chunks from your library and move them into the current deck.'
    : 'Browse all chunks, keep the library clean, and create new chunks fast.';
  const backHref = isMoveContext
    ? APP_ROUTES.deckEdit(deckIdFromQuery)
    : APP_ROUTES.decks;
  const backLabel = isMoveContext ? 'Back to Deck Workspace' : '';
  const createChunkHref = isMoveContext
    ? { pathname: APP_ROUTES.newChunk, query: { deckId: deckIdFromQuery } }
    : APP_ROUTES.newChunk;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        <section className="mx-auto flex w-full max-w-[1100px] flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-0">
          <div className="mb-10 text-center">
            <h1 className="text-[2rem] font-bold tracking-[0.01em] text-[rgba(1,1,1,0.75)] sm:text-[2.15rem]">
              {pageTitle}
            </h1>
            <p className="mt-3 text-[1.125rem] font-bold tracking-[0.01em] text-[#1D6FA5]">
              {pageDescription}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              {isMoveContext && (
                <Link
                  href={backHref}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {backLabel}
                </Link>
              )}
            </div>
            <Link
              href={createChunkHref}
              className="rounded-[5px] bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-[#2e78c0]"
            >
              Create Chunk
            </Link>
          </div>

          {isLoading && <PageLoader />}
          {error && <ErrorMessage message={error.message} />}
          {moveChunksMutation.error && (
            <ErrorMessage message={moveChunksMutation.error.message} />
          )}
          {result && (
            <div className="overflow-hidden rounded-[5px] border border-[rgba(1,1,1,0.1)] bg-white">
              <Grid
                id="chunks-grid"
                rowData={result}
                columnDefs={columnDefs}
                onRowClick={isMoveContext ? undefined : handleChunkRowClick}
                quickFilterPlaceholder="Search"
                emptyMessage={
                  isMoveContext
                    ? 'No movable chunks available.'
                    : 'No chunks found.'
                }
                paginate
                pageSize={5}
              />
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
