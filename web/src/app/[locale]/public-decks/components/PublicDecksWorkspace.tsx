'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@/i18n/navigation';

import {
  DECKS_QUERY_KEYS,
  type PublicDeckRecord,
  useCopyPublicDeckMutation,
} from '@features/decks';
import { Grid } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { useNotification } from '@shared/providers';
import usePublicDeckGridColumns from './hooks/usePublicDeckGridColumns';

interface PublicDecksWorkspaceProps {
  decks: PublicDeckRecord[];
}

export default function PublicDecksWorkspace({
  decks,
}: PublicDecksWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success } = useNotification();
  const [copiedDeckId, setCopiedDeckId] = useState<string | null>(null);
  const [pendingCopyDeckId, setPendingCopyDeckId] = useState<string | null>(null);

  const copyDeck = useCopyPublicDeckMutation({
    onSuccess: (deck) => {
      setCopiedDeckId(pendingCopyDeckId);
      setPendingCopyDeckId(null);
      success('Deck copied successfully.');
      void queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      router.push(APP_ROUTES.deckEdit(deck.id));
    },
    onError: () => {
      setPendingCopyDeckId(null);
    },
  });

  const columnDefs = usePublicDeckGridColumns({
    copiedDeckId,
    isCopyingDeckId: copyDeck.isLoading ? pendingCopyDeckId : null,
    onCopy: (deck) => {
      setPendingCopyDeckId(deck.id);
      void copyDeck.fetch({ id: deck.id });
    },
  });

  const kidsDeckCount = decks.filter(
    (deck) => deck.presentationMode === 'kids',
  ).length;
  const quizDeckCount = decks.filter(
    (deck) => deck.isWhatDidYouHearEligible,
  ).length;

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-0">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold tracking-[0.01em] text-ink-heading sm:text-[2.15rem]">
            Public decks
          </h1>
          <p className="mt-3 text-[1.05rem] text-slate-600">
            Browse decks shared by the community and copy the ones you want into
            your own library.
          </p>
          <p className="mt-2 text-sm font-semibold text-brand">
            {kidsDeckCount} kids decks and {quizDeckCount} listening quiz decks ready to reuse. Copied decks keep quiz settings and image-audio cards.
          </p>
        </div>

        <Link
          href={APP_ROUTES.decks}
          className="rounded-[5px] border border-line-soft bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Decks
        </Link>
      </div>

      <Grid
        id="public-decks-grid"
        rowData={decks}
        columnDefs={columnDefs}
        emptyMessage="No public decks available yet."
        quickFilterPlaceholder="Search public decks"
        paginate
        pageSize={6}
      />
    </section>
  );
}
