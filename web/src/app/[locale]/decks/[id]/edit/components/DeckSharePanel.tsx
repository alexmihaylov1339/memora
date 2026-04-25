import { useMemo } from 'react';

import { Button, ErrorMessage, FormBuilder, type FieldConfig } from '@shared/components';
import {
  useCreateDeckShareMutation,
  useRemoveDeckShareMutation,
} from '@features/decks';
import type { DeckShareRecord } from '@features/decks';
import styles from '@features/decks/components/CreateDeckForm.module.scss';

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
  const shareFields = useMemo<FieldConfig[]>(
    () => [
      {
        type: 'text',
        name: 'identifier',
        label: 'Username or email.',
        required: true,
        placeholder: 'alex or alex@gmail.com',
        fieldWrapperClassName: 'md:col-span-1',
        labelClassName: 'mb-1 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm outline-none ring-0 focus:border-brand-accent',
      },
      {
        type: 'select',
        name: 'permission',
        label: 'Permission',
        required: true,
        options: [
          { value: 'view', label: 'View' },
          { value: 'edit', label: 'Edit' },
        ],
        fieldWrapperClassName: 'md:col-span-1',
        labelClassName: 'mb-1 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm outline-none focus:border-brand-accent',
      },
    ],
    [],
  );

  const shareDeck = useCreateDeckShareMutation({
    onSuccess: () => {
      onChanged();
    },
  });

  const removeDeckShare = useRemoveDeckShareMutation({
    onSuccess: onChanged,
  });

  async function handleSubmit(values: {
    identifier: string;
    permission: DeckShareRecord['permission'];
  }) {
    await shareDeck.fetch({
      deckId,
      identifier: values.identifier.trim(),
      permission: values.permission,
    });
  }

  function handleRemove(sharedUserId: string) {
    void removeDeckShare.fetch({ deckId, sharedUserId });
  }

  return (
    <section className={styles.shareSurface}>
      <div className="mb-4">
        <h2 className="text-[28px] font-semibold text-ink-strong">Share Deck</h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Invite by username or email. Shared users can see the deck and its content.
        </p>
      </div>

      <FormBuilder<{ identifier: string; permission: DeckShareRecord['permission'] }>
        fields={shareFields}
        onSubmit={handleSubmit}
        submitLabel="Share Deck"
        submitButtonClassName="h-10 rounded-[4px] bg-brand-accent px-8 text-white transition hover:opacity-90 disabled:opacity-60"
        formClassName="grid items-end gap-3 md:grid-cols-[1fr_120px_auto]"
        actionsContainerClassName="flex items-end"
        initialValues={{ permission: 'view' }}
        translateFields={false}
        resetOnSubmit
        errorMessage={shareDeck.error?.message}
      />

      <div className="mt-5">
        <h3 className="text-lg font-semibold text-ink-strong">
          Shared users
        </h3>

        {sharedUsers.length === 0 ? (
          <p className="mt-2 text-sm text-ink-subtle">No shared users yet.</p>
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
