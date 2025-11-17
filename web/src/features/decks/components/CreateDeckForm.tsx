'use client';

// Modules
import { useQueryClient } from '@tanstack/react-query';

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

// Styles
import styles from './CreateDeckForm.module.scss';

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const handleCreateSuccess = (data: { name: string }) => {
    // Invalidate decks cache to refresh the list
    queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });

    // Show success notification
    success(`Deck "${data.name}" created successfully!`);
  };

  const handleCreateError = (err: Error) => {
    console.error('Failed to create deck:', err);
    error('Failed to create deck. Please try again.');
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
        submitLabel={createDeck.isLoading ? 'Creating...' : 'Create Deck'}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}

