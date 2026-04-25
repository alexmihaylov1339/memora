'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, FormBuilder } from '@shared/components';
import { APP_ROUTES, BUTTON_STYLES } from '@shared/constants';
import { useCreateCardFormFields, useCreateCardMutation } from '@features/decks';
import { CardsPageHeader } from '../components';

export default function NewCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdParam = searchParams.get('deckId')?.trim() ?? '';
  const fields = useCreateCardFormFields();

  const createCard = useCreateCardMutation({
    onSuccess: (card) => {
      router.replace(APP_ROUTES.cardEdit(card.id));
    },
  });

  const handleCreate = (values: {
    kind: string;
    front: string;
    back: string;
  }) => {
    createCard.fetch({
      deckId: deckIdParam || undefined,
      kind: values.kind.trim(),
      fields: {
        front: values.front.trim(),
        back: values.back.trim(),
      },
    });
  };

  const backHref = deckIdParam
    ? APP_ROUTES.deckEdit(deckIdParam)
    : APP_ROUTES.decks;
  const backLabel = deckIdParam ? 'Back to Deck Workspace' : 'Back to Decks';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader
          title="Create Card"
          backHref={backHref}
          backLabel={backLabel}
        />

        <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
          <FormBuilder<{
            kind: string;
            front: string;
            back: string;
          }>
            fields={fields}
            initialValues={{
              kind: 'basic',
              front: '',
              back: '',
            }}
            onSubmit={handleCreate}
            submitLabel="Create Card"
            submitButtonClassName={BUTTON_STYLES.primarySolid}
            actionsContainerClassName="mt-3 flex items-center justify-end gap-3"
            errorMessage={createCard.error?.message}
            translateFields={false}
            resetOnSubmit={false}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
