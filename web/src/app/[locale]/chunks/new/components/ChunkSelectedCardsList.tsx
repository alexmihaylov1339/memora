import type { CardRecord } from '@features/decks';
import ChunkSelectedCardItem from './ChunkSelectedCardItem';

interface ChunkSelectedCardsListProps {
  selectedCards: CardRecord[];
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
}

export default function ChunkSelectedCardsList({
  selectedCards,
  onMoveCard,
  onRemoveCard,
}: ChunkSelectedCardsListProps) {
  if (selectedCards.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">No cards selected yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Pick cards from the deck list to build the chunk sequence.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {selectedCards.map((card, index) => (
        <ChunkSelectedCardItem
          key={card.id}
          card={card}
          index={index}
          isFirst={index === 0}
          isLast={index === selectedCards.length - 1}
          onMoveCard={onMoveCard}
          onRemoveCard={onRemoveCard}
        />
      ))}
    </ul>
  );
}
