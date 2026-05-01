import { Button } from '@shared/components';

interface PracticeNavigationProps {
  hasNextItem: boolean;
  hasPreviousItem: boolean;
  onNext: () => void;
  onPrevious: () => void;
  totalCount: number;
}

export default function PracticeNavigation({
  hasNextItem,
  hasPreviousItem,
  onNext,
  onPrevious,
  totalCount,
}: PracticeNavigationProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!hasPreviousItem}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </Button>
        <Button
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!hasNextItem || totalCount === 0}
          onClick={onNext}
          type="button"
        >
          Next
        </Button>
      </div>
    </section>
  );
}
