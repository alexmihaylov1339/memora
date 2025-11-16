'use client';

// Modules
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Components
import { FormBuilder } from '@shared/components';

// Hooks
import { useService } from '@shared/hooks';

// Services
import { deckService } from '../services';

// Constants
import { DECKS_QUERY_KEYS, createDeckFormFields } from '../constants';

// Styles
import styles from './CreateDeckForm.module.scss';

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createDeck = useService(deckService.create, {
    onSuccess: (data) => {
      // Invalidate decks cache to refresh the list
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });

      // Show success message
      setSuccessMessage(`Deck "${data.name}" created successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      console.error('Failed to create deck:', error);
    },
  });

  const handleSubmit = async (formData: FormData) => {
    // Clear any previous success message
    setSuccessMessage(null);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    await createDeck.fetch({
      name,
      description: description || undefined,
    });
  };

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      <FormBuilder
        fields={createDeckFormFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? 'Creating...' : 'Create Deck'}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}

