import { BackLinkButton } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

export default function EditDeckHeader() {
  return (
    <header className="mx-auto mb-8 w-full max-w-[621px]">
      <h1 className="text-center text-4xl font-semibold text-ink-strong">Edit Deck</h1>
      <p className="mt-2 text-center text-lg font-semibold text-brand-accent">
        A deck is just a promise to yourself. Keep it.
      </p>

      <div className="mt-5">
        <BackLinkButton href={APP_ROUTES.decks}>
          Back to Decks
        </BackLinkButton>
      </div>
    </header>
  );
}
