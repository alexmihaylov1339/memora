import { useMemo, useState } from 'react';

import { Button, FormBuilder, type FieldConfig } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
import {
  DeckCardSelectionPanel,
  DeckChunkSelectionPanel,
  ImportCsvModal,
  formatDeckReviewIntervalsInput,
  parseDeckReviewIntervalsInput,
  useDeckEditFormFields,
  type ImportCardsResponse,
} from '@features/decks';
import type { SearchResultItem } from '@features/search';
import styles from '@features/decks/components/CreateDeckForm.module.scss';

interface DeckEditFormProps {
  id: string;
  name: string;
  description?: string;
  reviewIntervalHours: number[];
  initialCards?: SearchResultItem[];
  initialChunks?: SearchResultItem[];
  onUpdate: (payload: {
    id: string;
    name: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
    reviewIntervalHours?: number[];
  }) => Promise<void> | void;
  onDelete: () => void;
  isDeleting: boolean;
  updateError?: string;
  deleteError?: string;
  onImportComplete?: (result: ImportCardsResponse) => void;
}

export default function DeckEditForm({
  id,
  name,
  description,
  reviewIntervalHours,
  initialCards = [],
  initialChunks = [],
  onUpdate,
  onDelete,
  isDeleting,
  updateError,
  deleteError,
  onImportComplete,
}: DeckEditFormProps) {
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>(initialCards);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>(initialChunks);
  const [intervalError, setIntervalError] = useState<string | undefined>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    reviewIntervalsInput: string;
    cardIds?: string[];
    chunkIds?: string[];
  }) {
    let nextReviewIntervalHours: number[];
    try {
      nextReviewIntervalHours = parseDeckReviewIntervalsInput(
        values.reviewIntervalsInput,
      );
      setIntervalError(undefined);
    } catch (parseError) {
      setIntervalError(
        parseError instanceof Error ? parseError.message : 'Invalid intervals',
      );
      return;
    }

    await onUpdate({
      id,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      cardIds: values.cardIds,
      chunkIds: values.chunkIds,
      reviewIntervalHours: nextReviewIntervalHours,
    });
  }

  return (
    <>
      <FormBuilder<{
        name: string;
        description?: string;
        reviewIntervalsInput: string;
        cardIds?: string[];
        chunkIds?: string[];
      }>
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={{
          name,
          description: description ?? '',
          reviewIntervalsInput: formatDeckReviewIntervalsInput(
            reviewIntervalHours,
          ),
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
        errorMessage={intervalError ?? updateError ?? deleteError}
        formClassName={`${styles.container} ${styles.form}`}
        leadingAction={
          <Button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
          >
            Import CSV
          </Button>
        }
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        deckId={id}
        onImportComplete={(result) => {
          setIsImportModalOpen(false);
          onImportComplete?.(result);
        }}
      />
    </>
  );
}
