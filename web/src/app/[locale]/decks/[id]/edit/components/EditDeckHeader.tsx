import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@shared/constants';

export default function EditDeckHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-center text-4xl font-semibold text-ink-strong">Edit Deck</h1>
      <p className="mt-2 text-center text-lg font-semibold text-brand-accent">
        A deck is just a promise to yourself. Keep it.
      </p>

      <div className="mt-5">
        <Link
          href={APP_ROUTES.decks}
          className="inline-flex items-center rounded-md border border-line bg-white px-3 py-1.5 text-sm text-[var(--primary)] transition hover:bg-slate-50"
        >
          Back to Decks
        </Link>
      </div>
    </header>
  );
}
