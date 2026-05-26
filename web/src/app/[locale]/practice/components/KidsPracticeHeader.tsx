import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface KidsPracticeHeaderProps {
  positionLabel: string;
}

export default function KidsPracticeHeader({
  positionLabel,
}: KidsPracticeHeaderProps) {
  return (
    <header className="rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_50%,#ecfeff_100%)] p-4 shadow-sm sm:rounded-[28px] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            Kids mode
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Picture practice
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Tap the sound button, say the word together, and keep going.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
          <p className="rounded-full bg-white/80 px-4 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm">
            {positionLabel}
          </p>
          <Link
            href={APP_ROUTES.decks}
            className="rounded-full border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-4 sm:py-2"
          >
            Back to Decks
          </Link>
        </div>
      </div>
    </header>
  );
}
