'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useMemo, useState } from 'react';

import { Button, FormBuilder, type FieldConfig } from '@shared/components';
import { useNotification } from '@shared/providers';
import { APP_ROUTES } from '@shared/constants';
import { useCreateDeckMutation, useImportCardsMutation } from '../hooks';
import type { CreateDeckDto } from '../types';
import { parseDeckReviewIntervalsInput } from '../utils';
import type { SearchResultItem } from '../../search/types';
import { DECKS_QUERY_KEYS, createDeckFormFields } from '../constants';
import { TRANSLATION_KEYS } from '@/i18n';
import DeckCardSelectionPanel from './DeckCardSelectionPanel';
import DeckChunkSelectionPanel from './DeckChunkSelectionPanel';
import { ImportCsvModal } from './ImportCsvModal';

import styles from './CreateDeckForm.module.scss';
import type { DeckPresentationMode } from '../constants';

interface CreateDeckFormValues extends Omit<CreateDeckDto, 'reviewIntervalHours'> {
  presentationMode: DeckPresentationMode;
  reviewIntervalsInput: string;
}

export default function CreateDeckForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error, warning } = useNotification();
  const t = useTranslations();
  const [selectedCards, setSelectedCards] = useState<SearchResultItem[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<SearchResultItem[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingCsvFile, setPendingCsvFile] = useState<File | null>(null);
  const [pendingCsvRowCount, setPendingCsvRowCount] = useState(0);

  const createDeck = useCreateDeckMutation();
  const importMutation = useImportCardsMutation();

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

  async function handleSubmit(values: CreateDeckFormValues) {
    let reviewIntervalHours: number[];
    try {
      reviewIntervalHours = parseDeckReviewIntervalsInput(
        values.reviewIntervalsInput,
      );
    } catch (parseError) {
      error(parseError instanceof Error ? parseError.message : 'Invalid intervals');
      return;
    }

    let deck: Awaited<ReturnType<typeof createDeck.fetch>>;
    try {
      deck = await createDeck.fetch({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        cardIds: values.cardIds,
        chunkIds: values.chunkIds,
        presentationMode: values.presentationMode,
        reviewIntervalHours,
      });
    } catch {
      return;
    }

    queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });

    if (pendingCsvFile) {
      try {
        const importResult = await importMutation.fetch({
          file: pendingCsvFile,
          deckId: deck.id,
        });
        const msgKey =
          importResult.skipped.length > 0
            ? TRANSLATION_KEYS.cards.importSuccessWithSkipped
            : TRANSLATION_KEYS.cards.importSuccess;
        success(msgKey, {
          created: importResult.created,
          skipped: importResult.skipped.length,
        });
      } catch {
        warning(TRANSLATION_KEYS.decks.csvImportFailed);
      }
      router.replace(APP_ROUTES.deckEdit(deck.id));
    } else {
      success(TRANSLATION_KEYS.decks.createSuccess, { name: deck.name });
      router.replace(APP_ROUTES.decks);
    }
  }

  return (
    <div className={styles.container}>
      <FormBuilder<CreateDeckFormValues>
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? t(TRANSLATION_KEYS.decks.creating) : t(TRANSLATION_KEYS.decks.createButton)}
        submitButtonClassName={styles.primaryButton}
        errorMessage={createDeck.error?.message}
        formClassName={styles.form}
        actionsContainerClassName={styles.actionRow}
        resetOnSubmit={false}
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

      {pendingCsvFile && (
        <p className="mt-2 text-sm text-ink-subtle">
          {pendingCsvRowCount} cards from CSV will be imported when you save.
        </p>
      )}

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        deferred
        onDeferredConfirm={(file, rowCount) => {
          setPendingCsvFile(file);
          setPendingCsvRowCount(rowCount);
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}
