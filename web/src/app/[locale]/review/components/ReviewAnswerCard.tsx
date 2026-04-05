import { Button } from '@shared/components';
import type { BasicReviewCardFields } from '@features/reviews';

interface ReviewAnswerCardProps {
  basicCardFields: BasicReviewCardFields;
  isAnswerRevealed: boolean;
  onRevealAnswer: () => void;
}

export default function ReviewAnswerCard({
  basicCardFields,
  isAnswerRevealed,
  onRevealAnswer,
}: ReviewAnswerCardProps) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6">
      <p className="text-xs uppercase tracking-wide text-slate-500">Front</p>
      <p className="mt-3 text-xl font-semibold leading-relaxed text-slate-900">
        {basicCardFields.front}
      </p>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Back</p>
          {!isAnswerRevealed && (
            <Button
              type="button"
              onClick={onRevealAnswer}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Reveal Answer
            </Button>
          )}
        </div>

        {isAnswerRevealed ? (
          <p className="mt-3 text-lg leading-relaxed text-slate-700">
            {basicCardFields.back}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Reveal the answer before grading the card.
          </p>
        )}
      </div>
    </div>
  );
}
