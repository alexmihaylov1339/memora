import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface KidsPracticeHeaderProps {
  positionLabel: string;
}

export default function KidsPracticeHeader({
  positionLabel,
}: KidsPracticeHeaderProps) {
  return (
    <header className="rounded-[18px] border border-amber-200 bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_50%,#ecfeff_100%)] p-3 shadow-sm sm:rounded-[22px] sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500 sm:text-sm">
            Kids mode
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Picture practice
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tap the sound button, say the word together, and keep going.
          </p>
        </div>

        <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
          <p className="flex-1 rounded-full bg-white/80 px-4 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm sm:flex-none">
            {positionLabel}
          </p>
          <Link
            href={APP_ROUTES.decks}
            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none"
          >
            Back to Decks
          </Link>
        </div>
      </div>
    </header>
  );
}
