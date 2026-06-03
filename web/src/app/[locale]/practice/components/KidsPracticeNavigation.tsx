import { Button } from '@shared/components';

interface KidsPracticeNavigationProps {
  hasNextItem: boolean;
  hasPreviousItem: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function KidsPracticeNavigation({
  hasNextItem,
  hasPreviousItem,
  onNext,
  onPrevious,
}: KidsPracticeNavigationProps) {
  return (
    <section className="rounded-[18px] border border-sky-200 bg-white/90 p-2 shadow-sm sm:rounded-[22px] sm:p-3 lg:sticky lg:top-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <Button
          className="min-h-12 rounded-[18px] border border-slate-300 bg-slate-50 px-5 py-3 text-base font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14"
          disabled={!hasPreviousItem}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </Button>
        <Button
          className="min-h-12 rounded-[18px] bg-[linear-gradient(135deg,#0f766e_0%,#14b8a6_100%)] px-5 py-3 text-base font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14"
          disabled={!hasNextItem}
          onClick={onNext}
          type="button"
        >
          Next
        </Button>
      </div>
    </section>
  );
}
