import { Button } from '@shared/components';

const REVIEW_GRADE_OPTIONS = ['again', 'hard', 'good', 'easy'] as const;

export default function ReviewGradeButtons() {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Grades</h3>
          <p className="mt-1 text-sm text-slate-600">
            Grade submission wiring lands in T7. These controls are shown now to lock the UI shape.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {REVIEW_GRADE_OPTIONS.map((grade) => (
          <Button
            key={grade}
            type="button"
            disabled
            className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {grade}
          </Button>
        ))}
      </div>
    </section>
  );
}
