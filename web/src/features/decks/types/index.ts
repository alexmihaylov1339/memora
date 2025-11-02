export interface CreateDeckDto {
  name: string;
  description?: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  count: number;
  createdAt?: string;
  updatedAt?: string;
}

