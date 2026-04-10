export const SEARCH_ENTITY_TYPES = {
  deck: 'deck',
  card: 'card',
  chunk: 'chunk',
} as const;

export type SearchEntityType =
  (typeof SEARCH_ENTITY_TYPES)[keyof typeof SEARCH_ENTITY_TYPES];

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  label: string;
  description?: string;
}

export const SEARCH_SELECTION_MODES = {
  single: 'single',
  multiple: 'multiple',
} as const;

export type SearchSelectionMode =
  (typeof SEARCH_SELECTION_MODES)[keyof typeof SEARCH_SELECTION_MODES];

export interface SearchQueryParams {
  q: string;
  type: SearchEntityType;
  limit?: number;
}

export interface SearchRequest {
  q: string;
  limit: number;
}

export type SearchServiceFunction = (
  request: SearchRequest,
) => Promise<SearchResultItem[]>;
