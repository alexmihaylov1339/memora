'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, PageLoader, ErrorMessage, FormBuilder } from '@shared/components';
import { APP_ROUTES, BUTTON_STYLES } from '@shared/constants';
import {
  type CardKindFormValues,
  getCardKindOptions,
  parseCardKindFields,
  resolveSupportedCardKind,
  serializeCardKindFields,
  type SupportedCardKind,
  useCardDetailQuery,
  useDeleteCardMutation,
  useEditCardFormFields,
  useUpdateCardMutation,
  type CardRecord,
} from '@features/decks';
import { CardsPageHeader } from '../../components';
import { resolveSingleParam } from '@/shared/utils';

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
      router.replace(APP_ROUTES.cards);
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
  onUpdate: (payload: {
    id: string;
    kind: SupportedCardKind;
    fields: Record<string, unknown>;
  }) => void;
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
  const cardKind = useMemo(
    () => resolveSupportedCardKind(card.kind),
    [card.kind],
  );
  const [selectedKind, setSelectedKind] = useState<SupportedCardKind>(cardKind);
  const kindOptions = useMemo(() => getCardKindOptions(), []);
  const fields = useEditCardFormFields(selectedKind);
  const parsedKindFields = useMemo(
    () =>
      selectedKind === cardKind
        ? parseCardKindFields(cardKind, card.fields)
        : parseCardKindFields(selectedKind, {}),
    [card.fields, cardKind, selectedKind],
  );

  const handleUpdate = (values: CardKindFormValues) => {
    onUpdate({
      id: card.id,
      kind: selectedKind,
      fields: serializeCardKindFields(selectedKind, {
        ...values,
        kind: selectedKind,
      }),
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div>
        <label htmlFor="edit-card-kind" className="mb-2 block text-xs font-semibold text-ink-strong">
          Kind
        </label>
        <select
          id="edit-card-kind"
          value={selectedKind}
          onChange={(event) =>
            setSelectedKind(resolveSupportedCardKind(event.target.value))
          }
          className="h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent"
        >
          {kindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <FormBuilder<CardKindFormValues>
        key={`${card.id}-${selectedKind}`}
        fields={fields}
        initialValues={{
          kind: selectedKind,
          ...parsedKindFields,
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
