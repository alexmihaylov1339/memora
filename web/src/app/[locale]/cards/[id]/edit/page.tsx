'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, PageLoader, ErrorMessage, FormBuilder } from '@shared/components';
import { APP_ROUTES, BUTTON_STYLES } from '@shared/constants';
import {
  useCardDetailQuery,
  useDeleteCardMutation,
  useEditCardFormFields,
  useUpdateCardMutation,
  type CardRecord,
} from '@features/decks';
import { CARD_KIND_OPTIONS } from '@features/decks/services/cardService';
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

interface EditCardFormProps {
  card: CardRecord;
  onUpdate: (payload: { id: string; kind: string; fields: Record<string, unknown> }) => void;
  onDelete: () => void;
  updateError?: string;
  deleteError?: string;
  isDeleting: boolean;
}

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
        submitButtonClassName={BUTTON_STYLES.primarySolid}
        errorMessage={updateError}
        translateFields={false}
        actionsContainerClassName="mt-3 flex items-center justify-between gap-3"
        showDeleteButton
        deleteLabel="Delete Card"
        deleteButtonClassName={BUTTON_STYLES.destructiveSolid}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />

      {deleteError && <p className="text-sm text-[var(--destructive)]">{deleteError}</p>}
    </div>
  );
}
