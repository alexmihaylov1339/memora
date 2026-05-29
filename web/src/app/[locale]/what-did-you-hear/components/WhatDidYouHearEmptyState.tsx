import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@shared/constants';

interface WhatDidYouHearEmptyStateProps {
  description: string;
  title: string;
}

export default function WhatDidYouHearEmptyState({
  description,
  title,
}: WhatDidYouHearEmptyStateProps) {
  return (
    <section className="rounded-[16px] border border-line-soft bg-white p-6 text-center shadow-sm">
      <h1 className="text-2xl font-black text-slate-950">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-600">
        {description}
      </p>
      <Link
        className="mt-5 inline-flex rounded-[5px] border border-line-soft bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        href={APP_ROUTES.decks}
      >
        Back to Decks
      </Link>
    </section>
  );
}
