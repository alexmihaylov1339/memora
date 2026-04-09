'use client';

import { Link, useRouter } from '@/i18n/navigation';
import {
  EntitySearch,
  ErrorMessage,
  Grid,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { ChunkRecord } from '@features/chunks';
import { chunkService, useChunksListQuery } from '@features/chunks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import useChunkGridColumns from './components/useChunkGridColumns';

export default function ChunksPage() {
  const router = useRouter();
  const { isLoading, error, result } = useChunksListQuery();
  const columnDefs = useChunkGridColumns();

  function handleChunkSelect(id: string) {
    router.replace(APP_ROUTES.chunkEdit(id));
  }

  function handleChunkRowClick(chunk: ChunkRecord) {
    handleChunkSelect(chunk.id);
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Chunks</h1>

        <div className="mb-4">
          <Link
            href={APP_ROUTES.decks}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Back to Decks
          </Link>
        </div>

        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.chunk}
          search={chunkService.search}
          placeholder="Search chunks"
          onSelect={(item) => handleChunkSelect(item.id)}
        />

        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {result && (
          <Grid
            id="chunks-grid"
            rowData={result}
            columnDefs={columnDefs}
            onRowClick={handleChunkRowClick}
            emptyMessage="No chunks found."
            showQuickFilter
            quickFilterPlaceholder="Search chunks in grid"
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
