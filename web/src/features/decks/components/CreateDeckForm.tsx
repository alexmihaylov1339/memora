'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useService } from '@shared/hooks';
import { FormBuilder, FieldConfig } from '@shared/components';
import { deckService } from '../services';
import type { Deck } from '../types';

const formFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Deck Name',
    required: true,
    placeholder: 'Enter deck name',
  },
  {
    type: 'text',
    name: 'description',
    label: 'Description',
    placeholder: 'Optional description',
  },
];

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createDeck = useService(deckService.create, {
    onSuccess: (data) => {
      // Invalidate decks cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['decks'] });

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
    <div style={{ marginBottom: 24 }}>
      {successMessage && (
        <div style={{ padding: 12, marginBottom: 16, backgroundColor: '#d4edda', color: '#155724', borderRadius: 4 }}>
          {successMessage}
        </div>
      )}

      <FormBuilder
        fields={formFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? 'Creating...' : 'Create Deck'}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}

