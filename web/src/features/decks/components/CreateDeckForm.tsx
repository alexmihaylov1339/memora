'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';

import { FormBuilder } from '@shared/components';
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

  const handleSubmit = (values: CreateDeckDto) => {
    return createDeck.fetch({
      ...values,
      cardIds: selectedCards.map((item) => item.id),
      chunkIds: selectedChunks.map((item) => item.id),
    });
  };

  return (
    <div className={styles.container}>
      <DeckCardSelectionPanel
        selectedCards={selectedCards}
        onSelectionChange={setSelectedCards}
      />

      <DeckChunkSelectionPanel
        selectedChunks={selectedChunks}
        onSelectionChange={setSelectedChunks}
      />

      <FormBuilder<CreateDeckDto>
        fields={createDeckFormFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? t(TRANSLATION_KEYS.decks.creating) : t(TRANSLATION_KEYS.decks.createButton)}
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}
