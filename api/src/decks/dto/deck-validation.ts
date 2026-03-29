import { BadRequestException } from '@nestjs/common';
import type { CreateDeckDto } from './create-deck.dto';
import type { UpdateDeckDto } from './update-deck.dto';

export function validateDeckId(id: string): string {
  if (!id?.trim()) {
    throw new BadRequestException('id is required');
  }

  return id.trim();
}

export function validateCreateDeckInput(body: CreateDeckDto) {
  if (!body?.name?.trim()) {
    throw new BadRequestException('name is required');
  }
}

export function validateUpdateDeckInput(body: UpdateDeckDto) {
  if (!body || (body.name === undefined && body.description === undefined)) {
    throw new BadRequestException('at least one field is required');
  }

  if (body.name !== undefined && !body.name.trim()) {
    throw new BadRequestException('name cannot be empty');
  }
}
