import { Injectable } from '@nestjs/common';

@Injectable()
export class CardsService {
  getStatus() {
    return { module: 'cards', status: 'ready' as const };
  }
}
