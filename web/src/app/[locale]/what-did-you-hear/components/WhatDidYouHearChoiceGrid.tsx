import type { WhatDidYouHearChoice } from '@features/reviews';

interface WhatDidYouHearChoiceGridProps {
  choices: WhatDidYouHearChoice[];
  correctChoiceId: string | null;
  disabled: boolean;
  wrongChoiceId: string | null;
  onChoiceSelect: (choice: WhatDidYouHearChoice) => void;
}

function getChoiceClassName(input: {
  choice: WhatDidYouHearChoice;
  correctChoiceId: string | null;
  wrongChoiceId: string | null;
}): string {
  const baseClassName =
    'aspect-[4/3] h-full min-h-[7.5rem] max-h-[14rem] overflow-hidden rounded-[14px] border-4 bg-white shadow-sm transition sm:min-h-[9rem] lg:max-h-[16rem]';

  if (input.choice.isDisabled) {
    return `${baseClassName} cursor-not-allowed border-dashed border-slate-200 bg-slate-50 text-slate-500`;
  }

  if (input.correctChoiceId === input.choice.id) {
    return `${baseClassName} border-emerald-400 ring-4 ring-emerald-100`;
  }

  if (input.wrongChoiceId === input.choice.id) {
    return `${baseClassName} border-rose-300 ring-4 ring-rose-100`;
  }

  return `${baseClassName} border-white hover:border-sky-200 hover:shadow-md`;
}

export default function WhatDidYouHearChoiceGrid({
  choices,
  correctChoiceId,
  disabled,
  wrongChoiceId,
  onChoiceSelect,
}: WhatDidYouHearChoiceGridProps) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:gap-3">
      {choices.map((choice) => (
        <button
          key={choice.id}
          aria-label={choice.isDisabled ? 'No image' : 'Image choice'}
          className={getChoiceClassName({
            choice,
            correctChoiceId,
            wrongChoiceId,
          })}
          disabled={choice.isDisabled || disabled}
          onClick={() => onChoiceSelect(choice)}
          type="button"
        >
          {choice.imageAsset ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              src={choice.imageAsset.url}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-4 text-base font-black sm:text-lg">
              No image
            </span>
          )}
        </button>
      ))}
    </section>
  );
}
