export interface UpdateDeckDto {
  name?: string;
  description?: string;
  cardIds?: string[];
  chunkIds?: string[];
  presentationMode?: string;
  reviewIntervalHours?: number[];
  exerciseSettings?: unknown;
}
