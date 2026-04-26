import {
  getCardKindOptions,
  type SupportedCardKind,
} from '@features/decks/card-kinds';

interface CardFieldsEditorProps {
  kind: SupportedCardKind;
  onKindChange: (kind: SupportedCardKind) => void;
  front: string;
  onFrontChange: (value: string) => void;
  back: string;
  onBackChange: (value: string) => void;
}

export default function CardFieldsEditor({
  kind,
  onKindChange,
  front,
  onFrontChange,
  back,
  onBackChange,
}: CardFieldsEditorProps) {
  const kindOptions = getCardKindOptions();

  return (
    <>
      <div>
        <label htmlFor="kind" className="mb-1 block text-sm font-medium">
          Kind
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as SupportedCardKind)}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          {kindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
