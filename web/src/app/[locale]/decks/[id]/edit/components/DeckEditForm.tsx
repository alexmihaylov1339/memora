import { useMemo, useState } from 'react';

import { FormBuilder, type FieldConfig } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
import {
  DeckCardSelectionPanel,
  DeckChunkSelectionPanel,
  useDeckEditFormFields,
} from '@features/decks';
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
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>(initialCards);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>(initialChunks);
  const baseFields = useDeckEditFormFields();

  const fields = useMemo<FieldConfig[]>(
    () => [
      ...baseFields,
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
    [baseFields, selectedCards, selectedChunks],
  );

  async function handleSubmit(values: {
    name: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
  }) {
    await onUpdate({
      id,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      cardIds: values.cardIds,
      chunkIds: values.chunkIds,
    });
  }

  return (
    <FormBuilder<{
      name: string;
      description?: string;
      cardIds?: string[];
      chunkIds?: string[];
    }>
      fields={fields}
      onSubmit={handleSubmit}
      initialValues={{
        name,
        description: description ?? '',
      }}
      submitLabel="Save Changes"
      submitButtonClassName={styles.primaryButton}
      showDeleteButton
      deleteLabel="Delete Deck"
      deleteButtonClassName={BUTTON_STYLES.destructiveSolid}
      onDelete={onDelete}
      isDeleting={isDeleting}
      actionsContainerClassName={styles.actionRow}
      translateFields={false}
      resetOnSubmit={false}
      errorMessage={updateError ?? deleteError}
      formClassName={`${styles.container} ${styles.form}`}
    />
  );
}
