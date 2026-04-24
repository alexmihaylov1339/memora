import { useState, type FormEvent } from 'react';

import { Button } from '@shared/components';
import { DeckCardSelectionPanel, DeckChunkSelectionPanel } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import styles from '@features/decks/components/CreateDeckForm.module.scss';

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
  const [deckName, setDeckName] = useState(name);
  const [deckDescription, setDeckDescription] = useState(description ?? '');
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>(initialCards);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>(initialChunks);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onUpdate({
      id,
      name: deckName.trim(),
      description: deckDescription.trim() || undefined,
      cardIds: selectedCards.map((item) => item.id),
      chunkIds: selectedChunks.map((item) => item.id),
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <label className={styles.fieldLabel} htmlFor="edit-deck-name">
        Deck name*
      </label>
      <input
        id="edit-deck-name"
        name="name"
        value={deckName}
        onChange={(event) => setDeckName(event.target.value)}
        placeholder="Enter the Deck name"
        required
        className={styles.input}
      />

      <div className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="edit-deck-description">
          Description
        </label>
        <textarea
          id="edit-deck-description"
          name="description"
          value={deckDescription}
          onChange={(event) => setDeckDescription(event.target.value)}
          placeholder="Add Description"
          className={styles.textarea}
        />
      </div>

      <DeckCardSelectionPanel
        selectedCards={selectedCards}
        onSelectionChange={setSelectedCards}
      />

      <DeckChunkSelectionPanel
        selectedChunks={selectedChunks}
        onSelectionChange={setSelectedChunks}
      />

      {updateError && <p className="mt-3 text-sm text-[var(--destructive)]">{updateError}</p>}
      {deleteError && <p className="mt-3 text-sm text-[var(--destructive)]">{deleteError}</p>}

      <div className={styles.actionRow}>
        <Button
          type="button"
          onClick={onDelete}
          isLoading={isDeleting}
          className={styles.destructiveButton}
        >
          Delete Deck
        </Button>

        <Button type="submit" className={styles.primaryButton}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
