import { Button } from '@shared/components';
import type { SupportedReviewRenderer } from '@features/reviews';

interface ReviewAnswerCardProps {
  reviewRenderer: SupportedReviewRenderer;
  isAnswerRevealed: boolean;
  onRevealAnswer: () => void;
}

interface ReviewCardDisplay {
  promptLabel: string;
  prompt: string;
  answerLabel: string;
  answer: string;
  hint?: string;
}

function getReviewCardDisplay(
  reviewRenderer: SupportedReviewRenderer,
): ReviewCardDisplay {
  if (reviewRenderer.renderer === 'cloze_text') {
    return {
      promptLabel: 'Prompt',
      prompt: reviewRenderer.clozeTextCardFields.prompt,
      answerLabel: 'Answer',
      answer: reviewRenderer.clozeTextCardFields.answer,
      hint: reviewRenderer.clozeTextCardFields.hint,
    };
  }

  return {
    promptLabel: 'Front',
    prompt: reviewRenderer.basicCardFields.front,
    answerLabel: 'Back',
    answer: reviewRenderer.basicCardFields.back,
  };
}

export default function ReviewAnswerCard({
  reviewRenderer,
  isAnswerRevealed,
  onRevealAnswer,
}: ReviewAnswerCardProps) {
  const display = getReviewCardDisplay(reviewRenderer);

  return (
    <div className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {display.promptLabel}
      </p>
      <p className="mt-3 text-xl font-semibold leading-relaxed text-slate-900">
        {display.prompt}
      </p>
      {display.hint && (
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Hint: {display.hint}
        </p>
      )}

      <div className="mt-6 border-t border-slate-200 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {display.answerLabel}
          </p>
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
            {display.answer}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Reveal the answer when you want to check it before grading.
          </p>
        )}
      </div>
    </div>
  );
}
