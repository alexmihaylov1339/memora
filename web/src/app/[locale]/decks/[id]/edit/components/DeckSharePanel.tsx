import { useState, type FormEvent } from 'react';

import { Button, ErrorMessage } from '@shared/components';
import {
  useCreateDeckShareMutation,
  useRemoveDeckShareMutation,
} from '@features/decks';
import type { DeckShareRecord } from '@features/decks';

interface DeckSharePanelProps {
  deckId: string;
  sharedUsers?: DeckShareRecord[];
  onChanged: () => void;
}

export default function DeckSharePanel({
  deckId,
  sharedUsers = [],
  onChanged,
}: DeckSharePanelProps) {
  const [identifier, setIdentifier] = useState('');
  const [permission, setPermission] =
    useState<DeckShareRecord['permission']>('view');

  const shareDeck = useCreateDeckShareMutation({
    onSuccess: () => {
      setIdentifier('');
      setPermission('view');
      onChanged();
    },
  });

  const removeDeckShare = useRemoveDeckShareMutation({
    onSuccess: onChanged,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await shareDeck.fetch({
      deckId,
      identifier: identifier.trim(),
      permission,
    });
  }

  function handleRemove(sharedUserId: string) {
    void removeDeckShare.fetch({ deckId, sharedUserId });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Share Deck</h2>
        <p className="mt-1 text-sm text-slate-600">
          Invite by username or email. Shared users can see the deck and its content.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_150px_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Username or email
            </span>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="alex or alex@example.com"
              className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-[var(--primary)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Permission
            </span>
            <select
              value={permission}
              onChange={(event) =>
                setPermission(event.target.value as DeckShareRecord['permission'])
              }
              className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button
              type="submit"
              isLoading={shareDeck.isLoading}
              className="h-10 rounded-md bg-[var(--primary)] px-4 text-white disabled:opacity-60"
            >
              Share
            </Button>
          </div>
        </div>

        {shareDeck.error && <ErrorMessage message={shareDeck.error.message} />}
      </form>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Shared users
        </h3>

        {sharedUsers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No shared users yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {sharedUsers.map((sharedUser) => (
              <li
                key={sharedUser.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {sharedUser.name ?? sharedUser.email}
                  </p>
                  <p className="text-xs text-slate-500">{sharedUser.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white px-2 py-1 text-xs uppercase tracking-wide text-slate-600">
                    {sharedUser.permission}
                  </span>
                  <Button
                    type="button"
                    onClick={() => handleRemove(sharedUser.userId)}
                    isLoading={
                      removeDeckShare.isLoading &&
                      removeDeckShare.result === undefined
                    }
                    className="rounded-md border border-[var(--destructive)] px-3 py-1.5 text-sm text-[var(--destructive)]"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {removeDeckShare.error && (
          <ErrorMessage message={removeDeckShare.error.message} className="mt-3" />
        )}
      </div>
    </section>
  );
}
