'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, FormBuilder } from '@shared/components';
import { APP_ROUTES, BUTTON_STYLES } from '@shared/constants';
import {
  type CardKindFormValues,
  getCardKindOptions,
  resolveSupportedCardKind,
  serializeCardKindFields,
  type SupportedCardKind,
  useCreateCardFormFields,
  useCreateCardMutation,
} from '@features/decks';
import { CardsPageHeader } from '../components';

export default function NewCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdParam = searchParams.get('deckId')?.trim() ?? '';
  const initialKind = useMemo(() => resolveSupportedCardKind('basic'), []);
  const [selectedKind, setSelectedKind] = useState<SupportedCardKind>(initialKind);
  const kindOptions = useMemo(() => getCardKindOptions(), []);
  const fields = useCreateCardFormFields(selectedKind);

  const createCard = useCreateCardMutation({
    onSuccess: (card) => {
      router.replace(APP_ROUTES.cardEdit(card.id));
    },
  });

  const handleCreate = (values: CardKindFormValues) => {
    createCard.fetch({
      deckId: deckIdParam || undefined,
      kind: selectedKind,
      fields: serializeCardKindFields(selectedKind, {
        ...values,
        kind: selectedKind,
      }),
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
          <div>
            <label htmlFor="create-card-kind" className="mb-2 block text-xs font-semibold text-ink-strong">
              Kind
            </label>
            <select
              id="create-card-kind"
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
            key={selectedKind}
            fields={fields}
            initialValues={{ kind: selectedKind }}
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
