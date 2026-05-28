import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { TRANSLATION_KEYS } from '@/i18n';
import { FormBuilder } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
import {
  CardDeckSelectionPanel,
  type CardAssetValue,
  type CardKindFormValues,
  type CardRecord,
  type Deck,
  getCardKindOptions,
  ImageAudioCardAssetsSection,
  parseCardKindFields,
  resolveSupportedCardKind,
  serializeCardKindFields,
  type SupportedCardKind,
  useEditCardFormFields,
} from '@features/decks';
import type { SearchResultItem } from '@features/search';

interface EditCardFormProps {
  card: CardRecord;
  decks: Deck[];
  onUpdate: (payload: {
    id: string;
    kind: SupportedCardKind;
    deckIds: string[];
    fields: Record<string, unknown>;
  }) => void;
  onDelete: () => void;
  updateError?: string;
  deleteError?: string;
  isDeleting: boolean;
}

export default function EditCardForm({
  card,
  decks,
  onUpdate,
  onDelete,
  updateError,
  deleteError,
  isDeleting,
}: EditCardFormProps) {
  const t = useTranslations();
  const cardKind = useMemo(() => resolveSupportedCardKind(card.kind), [card.kind]);
  const [selectedKind, setSelectedKind] = useState<SupportedCardKind>(cardKind);
  const [selectedDecks, setSelectedDecks] = useState<SearchResultItem[]>(
    () =>
      mapCardDecksToSearchResults(card, decks, t(TRANSLATION_KEYS.decks.cardsCount)),
  );
  const kindOptions = useMemo(() => getCardKindOptions(), []);
  const fields = useEditCardFormFields(selectedKind);
  const parsedKindFields = useMemo(
    () =>
      selectedKind === cardKind
        ? parseCardKindFields(cardKind, card.fields)
        : parseCardKindFields(selectedKind, {}),
    [card.fields, cardKind, selectedKind],
  );
  const [imageAsset, setImageAsset] = useState<CardAssetValue | undefined>(
    () => parsedKindFields.imageAsset,
  );
  const [audioAsset, setAudioAsset] = useState<CardAssetValue | undefined>(
    () => parsedKindFields.audioAsset,
  );

  function handleUpdate(values: CardKindFormValues) {
    onUpdate({
      id: card.id,
      kind: selectedKind,
      deckIds: selectedDecks.map((deck) => deck.id),
      fields: serializeCardKindFields(selectedKind, {
        ...values,
        kind: selectedKind,
        imageAsset,
        audioAsset,
      }),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div>
        <label htmlFor="edit-card-kind" className="mb-2 block text-xs font-semibold text-ink-strong">
          {t(TRANSLATION_KEYS.cards.kind)}
        </label>
        <select
          id="edit-card-kind"
          value={selectedKind}
          onChange={(event) =>
            setSelectedKind(resolveSupportedCardKind(event.target.value))
          }
          className="h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent"
        >
          {kindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <CardDeckSelectionPanel
        selectedDecks={selectedDecks}
        onSelectionChange={setSelectedDecks}
      />

      {selectedKind === 'image_audio' && (
        <ImageAudioCardAssetsSection
          imageAsset={imageAsset}
          audioAsset={audioAsset}
          onImageAssetChange={setImageAsset}
          onAudioAssetChange={setAudioAsset}
        />
      )}

      <FormBuilder<CardKindFormValues>
        key={`${card.id}-${selectedKind}`}
        fields={fields}
        initialValues={{
          kind: selectedKind,
          ...parsedKindFields,
        }}
        onSubmit={handleUpdate}
        submitLabel={t(TRANSLATION_KEYS.cards.saveChanges)}
        submitButtonClassName={BUTTON_STYLES.primarySolid}
        errorMessage={updateError}
        translateFields={false}
        actionsContainerClassName="mt-3 flex items-center justify-between gap-3"
        showDeleteButton
        deleteLabel={t(TRANSLATION_KEYS.cards.deleteButton)}
        deleteButtonClassName={BUTTON_STYLES.destructiveSolid}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />

      {deleteError && (
        <p className="text-sm text-[var(--destructive)]">{deleteError}</p>
      )}
    </div>
  );
}

function mapCardDecksToSearchResults(
  card: CardRecord,
  decks: Deck[],
  cardsLabel: string,
): SearchResultItem[] {
  const cardDeckIds = new Set(
    card.deckIds ?? (card.deckId ? [card.deckId] : []),
  );

  return decks
    .filter((deck) => cardDeckIds.has(deck.id))
    .map((deck) => ({
      id: deck.id,
      type: 'deck',
      label: deck.name,
      description: `${deck.count} ${cardsLabel}`,
    }));
}
