import type { CardRecord } from '@features/decks';
import ChunkAvailableCardItem from './ChunkAvailableCardItem';

interface ChunkAvailableCardsListProps {
  availableCards: CardRecord[];
  onAddCard: (cardId: string) => void;
}

export default function ChunkAvailableCardsList({
  availableCards,
  onAddCard,
}: ChunkAvailableCardsListProps) {
  if (availableCards.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">No more cards available to add.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {availableCards.map((card) => (
        <ChunkAvailableCardItem
          key={card.id}
          card={card}
          onAddCard={onAddCard}
        />
      ))}
    </ul>
  );
}
