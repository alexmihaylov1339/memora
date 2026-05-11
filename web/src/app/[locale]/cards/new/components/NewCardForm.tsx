import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { TRANSLATION_KEYS } from '@/i18n';
import { FormBuilder } from '@shared/components';
import { APP_ROUTES, BUTTON_STYLES } from '@shared/constants';
import {
  CardDeckSelectionPanel,
  type CardKindFormValues,
  getCardKindOptions,
  resolveSupportedCardKind,
  serializeCardKindFields,
  type SupportedCardKind,
  useCreateCardFormFields,
  useCreateCardMutation,
} from '@features/decks';
import type { SearchResultItem } from '@features/search';

interface NewCardFormProps {
  deckIdParam: string;
  initialKind: SupportedCardKind;
  initialSelectedDecks: SearchResultItem[];
}

export default function NewCardForm({
  deckIdParam,
  initialKind,
  initialSelectedDecks,
}: NewCardFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [selectedKind, setSelectedKind] =
    useState<SupportedCardKind>(initialKind);
  const [selectedDecks, setSelectedDecks] =
    useState<SearchResultItem[]>(initialSelectedDecks);
  const kindOptions = useMemo(() => getCardKindOptions(), []);
  const fields = useCreateCardFormFields(selectedKind);

  const createCard = useCreateCardMutation({
    onSuccess: () => {
      router.replace(
        deckIdParam ? APP_ROUTES.deckEdit(deckIdParam) : APP_ROUTES.cards,
      );
    },
  });

  function handleCreate(values: CardKindFormValues) {
    void createCard.fetch({
      deckIds: selectedDecks.map((deck) => deck.id),
      kind: selectedKind,
      fields: serializeCardKindFields(selectedKind, {
        ...values,
        kind: selectedKind,
      }),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div>
        <label
          htmlFor="create-card-kind"
          className="mb-2 block text-xs font-semibold text-ink-strong"
        >
          {t(TRANSLATION_KEYS.cards.kind)}
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

      <CardDeckSelectionPanel
        selectedDecks={selectedDecks}
        onSelectionChange={setSelectedDecks}
      />

      <FormBuilder<CardKindFormValues>
        key={selectedKind}
        fields={fields}
        initialValues={{ kind: selectedKind }}
        onSubmit={handleCreate}
        submitLabel={t(TRANSLATION_KEYS.cards.createButton)}
        submitButtonClassName={BUTTON_STYLES.primarySolid}
        actionsContainerClassName="mt-3 flex items-center justify-end gap-3"
        errorMessage={createCard.error?.message}
        translateFields={false}
        resetOnSubmit={false}
      />
    </div>
  );
}
