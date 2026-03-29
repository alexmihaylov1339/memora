import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunksService {
  getStatus() {
    return { module: 'chunks', status: 'ready' as const };
  }
}
