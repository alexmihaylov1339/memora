import { Link } from '@/i18n/navigation';
import { Translate } from '@shared/components';
import type { Deck } from '@features/decks';
import { TRANSLATION_KEYS } from '@/i18n';

interface DecksListProps {
  decks: Deck[];
}

export default function DecksList({ decks }: DecksListProps) {
  return (
    <ul className="list-none p-0">
      {decks.map((deck) => (
        <li key={deck.id} className="mb-2">
          <Link
            href={`/decks/${deck.id}/edit`}
            className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white px-4 py-3 hover:bg-slate-50"
          >
            <span className="font-bold">{deck.name}</span>
            <span className="text-sm text-slate-600">
              {deck.count} <Translate tKey={TRANSLATION_KEYS.decks.cardsCount} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
