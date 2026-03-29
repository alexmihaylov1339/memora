'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ErrorMessage, PageLoader, ProtectedRoute } from '@shared/components';
import {
  useDeckDetailQuery,
  useDeleteDeckMutation,
  useUpdateDeckMutation,
} from '@features/decks';
import { resolveSingleParam } from '@/shared/utils';
import { DeckEditForm, EditDeckHeader } from './components';

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const deckQuery = useDeckDetailQuery(id);

  const updateDeck = useUpdateDeckMutation({
    onSuccess: () => {
      deckQuery.refetch();
    },
  });

  const deleteDeck = useDeleteDeckMutation({
    onSuccess: () => {
      router.replace('/decks');
    },
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <EditDeckHeader />

        {deckQuery.isLoading && <PageLoader />}
        {deckQuery.error && <ErrorMessage message={deckQuery.error.message} />}

        {deckQuery.result && (
          <DeckEditForm
            key={deckQuery.result.id}
            id={deckQuery.result.id}
            name={deckQuery.result.name}
            description={deckQuery.result.description}
            onUpdate={(payload) => updateDeck.fetch(payload)}
            onDelete={() => deleteDeck.fetch({ id })}
            isDeleting={deleteDeck.isLoading}
            updateError={updateDeck.error?.message}
            deleteError={deleteDeck.error?.message}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
