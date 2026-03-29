'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, Button, PageLoader, ErrorMessage, FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  useCardDetailQuery,
  useDeleteCardMutation,
  useEditCardFormFields,
  useUpdateCardMutation,
} from '@features/decks';
import { CARD_KIND_OPTIONS } from '@features/decks/services/cardService';
import type { CardRecord } from '@features/decks/services/cardService';
import { CardsPageHeader } from '../../components';
import { isString, resolveSingleParam } from '@/shared/utils';

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const cardQuery = useCardDetailQuery(id);

  const updateCard = useUpdateCardMutation({
    onSuccess: () => {
      cardQuery.refetch();
    },
  });

  const deleteCard = useDeleteCardMutation({
    onSuccess: () => {
      router.replace(APP_ROUTES.decks);
    },
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader title="Edit Card" />

        {cardQuery.isLoading && <PageLoader />}
        {cardQuery.error && <ErrorMessage message={cardQuery.error.message} />}

        {cardQuery.result && (
          <EditCardForm
            key={cardQuery.result.id}
            card={cardQuery.result}
            onUpdate={(payload) => updateCard.fetch(payload)}
            onDelete={() => deleteCard.fetch({ id })}
            updateError={updateCard.error?.message}
            deleteError={deleteCard.error?.message}
            isDeleting={deleteCard.isLoading}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}

type EditCardFormProps = {
  card: CardRecord;
  onUpdate: (payload: { id: string; kind: string; fields: Record<string, unknown> }) => void;
  onDelete: () => void;
  updateError?: string;
  deleteError?: string;
  isDeleting: boolean;
};

function EditCardForm({
  card,
  onUpdate,
  onDelete,
  updateError,
  deleteError,
  isDeleting,
}: EditCardFormProps) {
  const fields = useEditCardFormFields();

  const handleUpdate = (values: { kind: string; front: string; back: string }) => {
    onUpdate({
      id: card.id,
      kind: values.kind.trim(),
      fields: {
        front: values.front.trim(),
        back: values.back.trim(),
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <FormBuilder<{ kind: string; front: string; back: string }>
        fields={fields}
        initialValues={{
          kind: CARD_KIND_OPTIONS.includes(card.kind as (typeof CARD_KIND_OPTIONS)[number])
            ? card.kind
            : 'basic',
          front: isString(card.fields.front) ? card.fields.front : '',
          back: isString(card.fields.back) ? card.fields.back : '',
        }}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        errorMessage={updateError}
        translateFields={false}
      />

      {deleteError && <p className="text-sm text-[var(--destructive)]">{deleteError}</p>}

      <div className="flex items-center gap-3">
        <Button
          onClick={onDelete}
          isLoading={isDeleting}
          className="rounded-md border border-[var(--destructive)] px-4 py-2 text-[var(--destructive)] disabled:opacity-60"
        >
          Delete Card
        </Button>
      </div>
    </div>
  );
}
