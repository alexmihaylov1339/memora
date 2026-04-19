export interface ListCardsQueryDto {
  limit?: number;
  offset?: number;
  direction?: 'asc' | 'desc';
}
