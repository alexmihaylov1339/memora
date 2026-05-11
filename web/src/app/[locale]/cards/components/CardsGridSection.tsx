import {
  EntitySearch,
  ErrorMessage,
  Grid,
  PageLoader,
  type GridColumnDef,
} from '@shared/components';
import { cardService, getCardPreview, type CardRecord } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';

interface CardsGridSectionProps {
  columnDefs: GridColumnDef<CardRecord>[];
  deleteError?: string;
  emptyMessage: string;
  errorMessage?: string;
  isLoading: boolean;
  isMoveContext: boolean;
  moveError?: string;
  onCardSelect: (id: string) => void;
  onDeleteCard?: (card: CardRecord) => Promise<void> | void;
  onRowClick?: (card: CardRecord) => void;
  quickFilterPlaceholder: string;
  result?: CardRecord[];
}

export default function CardsGridSection({
  columnDefs,
  deleteError,
  emptyMessage,
  errorMessage,
  isLoading,
  isMoveContext,
  moveError,
  onCardSelect,
  onDeleteCard,
  onRowClick,
  quickFilterPlaceholder,
  result,
}: CardsGridSectionProps) {
  return (
    <>
      {!isMoveContext && (
        <div className="mb-4">
          <EntitySearch
            queryKey={SEARCH_QUERY_KEYS.card}
            search={cardService.search}
            placeholder="Search"
            onSelect={(item) => onCardSelect(item.id)}
          />
        </div>
      )}

      {isLoading && <PageLoader />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {moveError && <ErrorMessage message={moveError} />}
      {deleteError && <ErrorMessage message={deleteError} />}
      {result && (
        <Grid
          id="cards-grid"
          rowData={result}
          columnDefs={columnDefs}
          onDelete={onDeleteCard}
          deleteConfirmationTitle="Delete card?"
          getDeleteConfirmationMessage={(card) =>
            `Delete ${getCardPreview(card).front || 'this card'}? This action cannot be undone.`
          }
          onRowClick={onRowClick}
          quickFilterPlaceholder={quickFilterPlaceholder}
          emptyMessage={emptyMessage}
          paginate
          pageSize={5}
        />
      )}
    </>
  );
}
