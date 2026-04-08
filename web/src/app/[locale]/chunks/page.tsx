'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { EntitySearch, ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { chunkService } from '@features/chunks';
import { SEARCH_QUERY_KEYS } from '@features/search';

export default function ChunksPage() {
  const router = useRouter();

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
          onSelect={(item) => {
            router.replace(APP_ROUTES.chunkEdit(item.id));
          }}
        />
      </main>
    </ProtectedRoute>
  );
}
