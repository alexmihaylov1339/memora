import { useState } from 'react';

import { Button, FormBuilder } from '@shared/components';
import { DeckCardSelectionPanel, DeckChunkSelectionPanel, useDeckEditFormFields } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import DeckActionLink from './DeckActionLink';

interface DeckEditFormProps {
  id: string;
  name: string;
  description?: string;
  initialCards?: SearchResultItem[];
  initialChunks?: SearchResultItem[];
  onUpdate: (payload: {
    id: string;
    name: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
  }) => Promise<void> | void;
  onDelete: () => void;
  isDeleting: boolean;
  updateError?: string;
  deleteError?: string;
}

export default function DeckEditForm({
  id,
  name,
  description,
  initialCards = [],
  initialChunks = [],
  onUpdate,
  onDelete,
  isDeleting,
  updateError,
  deleteError,
}: DeckEditFormProps) {
  const fields = useDeckEditFormFields();
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>(initialCards);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>(initialChunks);

  async function handleSubmit(values: { name: string; description?: string }) {
    await onUpdate({
      id,
      name: (values.name ?? '').trim(),
      description: values.description?.trim() || undefined,
      cardIds: selectedCards.map((item) => item.id),
      chunkIds: selectedChunks.map((item) => item.id),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <DeckCardSelectionPanel
        selectedCards={selectedCards}
        onSelectionChange={setSelectedCards}
      />

      <DeckChunkSelectionPanel
        selectedChunks={selectedChunks}
        onSelectionChange={setSelectedChunks}
      />

      <FormBuilder<{ name: string; description?: string }>
        fields={fields}
        initialValues={{ name, description: description ?? '' }}
        onSubmit={handleSubmit}
        submitLabel="Save Deck"
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        errorMessage={updateError}
        translateFields={false}
      />

      {deleteError && <p className="text-sm text-[var(--destructive)]">{deleteError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <DeckActionLink href={{ pathname: '/cards', query: { deckId: id } }}>
          Move Card
        </DeckActionLink>

        <DeckActionLink href={{ pathname: '/cards/new', query: { deckId: id } }}>
          Create Card
        </DeckActionLink>

        <DeckActionLink href={{ pathname: '/chunks', query: { deckId: id } }}>
          Move Chunk
        </DeckActionLink>

        <DeckActionLink href={{ pathname: '/chunks/new', query: { deckId: id } }}>
          Create Chunk
        </DeckActionLink>

        <Button
          onClick={onDelete}
          isLoading={isDeleting}
          className="rounded-md border border-[var(--destructive)] px-4 py-2 text-[var(--destructive)] disabled:opacity-60"
        >
          Delete Deck
        </Button>
      </div>
    </div>
  );
}
