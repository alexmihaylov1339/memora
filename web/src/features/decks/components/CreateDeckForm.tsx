'use client';

// Modules
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

// Components
import { FormBuilder } from '@shared/components';

// Hooks
import { useService } from '@shared/hooks';
import { useNotification } from '@shared/providers';

// Services
import { deckService } from '../services';

// Types
import type { CreateDeckDto } from '../types';

// Constants
import { DECKS_QUERY_KEYS, createDeckFormFields } from '../constants';
import { TRANSLATION_KEYS } from '@/i18n';

// Styles
import styles from './CreateDeckForm.module.scss';

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const t = useTranslations();

  const handleCreateSuccess = (data: { name: string }) => {
    queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
    success(TRANSLATION_KEYS.decks.createSuccess, { name: data.name });
  };

  const handleCreateError = (err: Error) => {
    console.error('Failed to create deck:', err);
    error(TRANSLATION_KEYS.decks.createError);
  };

  const createDeck = useService(deckService.create, {
    onSuccess: handleCreateSuccess,
    onError: handleCreateError,
  });

  const handleSubmit = (values: CreateDeckDto) => {
    return createDeck.fetch(values);
  };

  return (
    <div className={styles.container}>
      <FormBuilder<CreateDeckDto>
        fields={createDeckFormFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? t(TRANSLATION_KEYS.decks.creating) : t(TRANSLATION_KEYS.decks.createButton)}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}

