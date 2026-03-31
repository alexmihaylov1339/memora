'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { useCreateCardFormFields, useCreateCardMutation } from '@features/decks';
import { CardsPageHeader } from '../components';

export default function NewCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdParam = searchParams.get('deckId') ?? '';
  const fields = useCreateCardFormFields(deckIdParam);

  const createCard = useCreateCardMutation({
    onSuccess: (card) => {
      router.replace(APP_ROUTES.cardEdit(card.id));
    },
  });

  const handleCreate = (values: {
    deckId?: string;
    kind: string;
    front: string;
    back: string;
  }) => {
    const deckId = (deckIdParam || values.deckId || '').trim();
    if (!deckId) return;

    createCard.fetch({
      deckId,
      kind: values.kind.trim(),
      fields: {
        front: values.front.trim(),
        back: values.back.trim(),
      },
    });
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader title="Create Card" />

        <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
          <FormBuilder<{
            deckId?: string;
            kind: string;
            front: string;
            back: string;
          }>
            fields={fields}
            initialValues={{
              deckId: deckIdParam || undefined,
              kind: 'basic',
              front: '',
              back: '',
            }}
            onSubmit={handleCreate}
            submitLabel="Create Card"
            submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
            errorMessage={createCard.error?.message}
            translateFields={false}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
