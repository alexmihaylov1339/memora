export type SearchEntityType = 'deck' | 'card' | 'chunk';

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  label: string;
  description?: string;
}

export interface SearchInput {
  q: string;
  type: SearchEntityType;
  limit: number;
}
