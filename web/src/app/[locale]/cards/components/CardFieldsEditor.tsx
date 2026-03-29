import { CARD_KIND_OPTIONS } from '@features/decks/services/cardService';

type CardFieldsEditorProps = {
  kind: (typeof CARD_KIND_OPTIONS)[number];
  onKindChange: (kind: (typeof CARD_KIND_OPTIONS)[number]) => void;
  front: string;
  onFrontChange: (value: string) => void;
  back: string;
  onBackChange: (value: string) => void;
};

export default function CardFieldsEditor({
  kind,
  onKindChange,
  front,
  onFrontChange,
  back,
  onBackChange,
}: CardFieldsEditorProps) {
  return (
    <>
      <div>
        <label htmlFor="kind" className="mb-1 block text-sm font-medium">
          Kind
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as (typeof CARD_KIND_OPTIONS)[number])}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          {CARD_KIND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="front" className="mb-1 block text-sm font-medium">
          Front
        </label>
        <textarea
          id="front"
          value={front}
          onChange={(e) => onFrontChange(e.target.value)}
          className="min-h-24 w-full rounded-md border border-[var(--border)] px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="back" className="mb-1 block text-sm font-medium">
          Back
        </label>
        <textarea
          id="back"
          value={back}
          onChange={(e) => onBackChange(e.target.value)}
          className="min-h-24 w-full rounded-md border border-[var(--border)] px-3 py-2"
        />
      </div>
    </>
  );
}
