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
    <section className="rounded-[24px] border border-sky-200 bg-white/90 p-3 shadow-sm sm:rounded-[28px] sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="min-h-16 rounded-[24px] border border-slate-300 bg-slate-50 px-6 py-4 text-base font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
          disabled={!hasPreviousItem}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </Button>
        <Button
          className="min-h-16 rounded-[24px] bg-[linear-gradient(135deg,#0f766e_0%,#14b8a6_100%)] px-6 py-4 text-base font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
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
