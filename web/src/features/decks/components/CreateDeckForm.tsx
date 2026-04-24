'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useMemo, useState } from 'react';

import { FormBuilder, type FieldConfig } from '@shared/components';
import { useNotification } from '@shared/providers';
import { APP_ROUTES } from '@shared/constants';
import { useCreateDeckMutation } from '../hooks';
import type { CreateDeckDto } from '../types';
import type { SearchResultItem } from '../../search/types';
import { DECKS_QUERY_KEYS, createDeckFormFields } from '../constants';
import { TRANSLATION_KEYS } from '@/i18n';
import DeckCardSelectionPanel from './DeckCardSelectionPanel';
import DeckChunkSelectionPanel from './DeckChunkSelectionPanel';

import styles from './CreateDeckForm.module.scss';

export default function CreateDeckForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const t = useTranslations();
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>([]);

  const handleCreateSuccess = (data: { name: string }) => {
    queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
    success(TRANSLATION_KEYS.decks.createSuccess, { name: data.name });
    router.replace(APP_ROUTES.decks);
  };

  const handleCreateError = () => {
    error(TRANSLATION_KEYS.decks.createError);
  };

  const createDeck = useCreateDeckMutation({
    onSuccess: handleCreateSuccess,
    onError: handleCreateError,
  });

  const fields = useMemo<FieldConfig[]>(
    () => [
      ...createDeckFormFields,
      {
        type: 'grid',
        name: 'cardIds',
        label: 'Cards',
        value: selectedCards,
        onChange: (value) => setSelectedCards(value as SearchResultItem[]),
        serialize: (value) =>
          (value as SearchResultItem[]).map((item) => item.id),
        fieldWrapperClassName: styles.section,
        render: ({ value, onChange }) => (
          <DeckCardSelectionPanel
            selectedCards={value as SearchResultItem[]}
            onSelectionChange={(items) => onChange(items)}
          />
        ),
      },
      {
        type: 'grid',
        name: 'chunkIds',
        label: 'Chunks',
        value: selectedChunks,
        onChange: (value) => setSelectedChunks(value as SearchResultItem[]),
        serialize: (value) =>
          (value as SearchResultItem[]).map((item) => item.id),
        fieldWrapperClassName: styles.section,
        render: ({ value, onChange }) => (
          <DeckChunkSelectionPanel
            selectedChunks={value as SearchResultItem[]}
            onSelectionChange={(items) => onChange(items)}
          />
        ),
      },
    ],
    [selectedCards, selectedChunks],
  );

  async function handleSubmit(values: CreateDeckDto) {
    await createDeck.fetch({
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      cardIds: values.cardIds,
      chunkIds: values.chunkIds,
    });
  }

  return (
    <div className={styles.container}>
      <FormBuilder<CreateDeckDto>
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? t(TRANSLATION_KEYS.decks.creating) : t(TRANSLATION_KEYS.decks.createButton)}
        submitButtonClassName={`${styles.primaryButton} ml-auto mt-4 block`}
        errorMessage={createDeck.error?.message}
        formClassName={styles.form}
        resetOnSubmit={false}
      />

      <div className={styles.actionRow}>
        <span className="text-sm text-ink-subtle">
          {selectedCards.length} cards, {selectedChunks.length} chunks selected
        </span>
      </div>
    </div>
  );
}
