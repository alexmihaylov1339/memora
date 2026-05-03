import { isString } from '../common/utils/type-guards';

export interface CardSearchPreview {
  label: string;
  description?: string;
  searchableText: string;
}

interface SearchableCard {
  id: string;
  kind: string;
  fields: unknown;
}

const CLOZE_MARKER_PATTERN = /{{c1::(.*?)}}/g;

function normalizeText(value: unknown): string {
  return isString(value) ? value.trim() : '';
}

function getFields(card: SearchableCard): Record<string, unknown> {
  if (!card.fields || typeof card.fields !== 'object') {
    return {};
  }

  return card.fields as Record<string, unknown>;
}

function getClozePrompt(text: string): string {
  return text.replace(CLOZE_MARKER_PATTERN, '_____');
}

export function getCardSearchPreview(card: SearchableCard): CardSearchPreview {
  const fields = getFields(card);

  if (card.kind === 'cloze_text') {
    const text = normalizeText(fields.text);
    const answer = normalizeText(fields.answer);
    const hint = normalizeText(fields.hint);

    if (text) {
      return {
        label: getClozePrompt(text),
        description: answer || undefined,
        searchableText: [card.kind, text, answer, hint].join(' '),
      };
    }
  }

  const front = normalizeText(fields.front);
  const back = normalizeText(fields.back);

  return {
    label: front || 'Untitled card',
    description: back || undefined,
    searchableText: [card.kind, front, back].join(' '),
  };
}
